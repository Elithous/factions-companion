import express, { Request, Response } from 'express';
import { generateSoldierStatsByFaction, generateSoldierStatsByTile, getAllActivities, generatePlayerActionCounts } from "../services/reports/activityReport.service";
import { getAvailableGameIds, getConfig, getTimespan, getAllActivePlayers } from '../services/reports/gameReport.service';
import { WhereOptions, InferAttributes, WhereAttributeHashValue, Op } from 'sequelize';
import { ActivitiesModel } from '../models/activities/activities.model';
import { generateApmLeaderboard, generatePlayerMvpLeaderboard, generateTileLeaderboard, generateResourcesSentLeaderboard, generateResourcesReceivedLeaderboard } from '../services/reports/leaderboardReport.service';

export async function getSoldierStatsByFaction(req: Request, res: Response) {
    try {
        const { gameId, playerName, tileX, tileY, fromFaction, dateStart, dateEnd } = req.query;
        let whereQuery: WhereOptions<InferAttributes<ActivitiesModel>> = {
            game_id: gameId as string
        };
        if (playerName) {
            whereQuery.player_name = playerName as string;
        }
        if (tileX && tileY) {
            whereQuery.x = tileX as string;
            whereQuery.y = tileY as string;
        }
        if (fromFaction) {
            whereQuery.player_faction = fromFaction as string;
        }

        const createdQuery: WhereAttributeHashValue<number> = {}
        if (parseFloat(dateStart as string)) {
            createdQuery[Op.gte] = parseFloat(dateStart as string);
        }
        if (parseFloat(dateEnd as string)) {
            createdQuery[Op.lte] = parseFloat(dateEnd as string);
        }
        if (createdQuery[Op.gte] || createdQuery[Op.lte]) {
            whereQuery.created_at = createdQuery;
        }

        const stats = await generateSoldierStatsByFaction(whereQuery);

        res.status(200).send(stats);
    } catch (error) {
        res.status(400).json({ message: `Error getting soldier data: ${error}` });
    }
}

export async function getSoliderStatsByTile(req: Request, res: Response) {
    try {
        const { gameId, playerName, fromFaction, dateStart, dateEnd } = req.query;
        let whereQuery: WhereOptions<InferAttributes<ActivitiesModel>> = {
            game_id: gameId as string
        };
        if (playerName) {
            whereQuery.player_name = playerName as string;
        }
        if (fromFaction) {
            whereQuery.player_faction = fromFaction as string;
        }
        const createdQuery: WhereAttributeHashValue<number> = {}
        if (parseFloat(dateStart as string)) {
            createdQuery[Op.gte] = parseFloat(dateStart as string);
        }
        if (parseFloat(dateEnd as string)) {
            createdQuery[Op.lte] = parseFloat(dateEnd as string);
        }
        if (createdQuery[Op.gte] || createdQuery[Op.lte]) {
            whereQuery.created_at = createdQuery;
        }

        const stats = await generateSoldierStatsByTile(whereQuery);

        res.status(200).send(stats);
    } catch (error) {
        res.status(400).json({ message: `Error getting soldier data: ${error}` });
    }
}

export async function getPlayerMvpLeaderboard(req: Request, res: Response) {
    try {
        const { gameId } = req.query;

        const stats = await generatePlayerMvpLeaderboard(gameId as string);

        let output = '';
        stats.forEach((stat, index) => {
            output += `${index + 1}:${stat.name}(${stat.faction.substring(0, 1)}) - ${stat.score}\r\n`;
        });

        res.status(200).send(output);
    } catch (error) {
        res.status(400).json({ message: `Error getting soldier data: ${error}` });
    }
}

export async function getPlayerApmLeaderboard(req: Request, res: Response) {
    try {
        const { gameId, timespan } = req.query;
        const contentType = req.headers['accept'] || 'text/html';

        // Parse timespans - can be a single value or comma-separated list
        let timespans: number[] = [];
        if (typeof timespan === 'string') {
            timespans = timespan.split(',')
                .map(t => parseFloat(t.trim()))
                .filter(t => !isNaN(t));
        } else if (Array.isArray(timespan)) {
            timespans = timespan
                .map(t => parseFloat(String(t).trim()))
                .filter(t => !isNaN(t));
        }

        // Default to 60 seconds if no valid timespans provided
        if (timespans.length === 0) {
            timespans = [60];
        }

        // Sort timespans in ascending order
        timespans.sort((a, b) => a - b);

        // Get stats for each timespan
        const allStats = await Promise.all(
            timespans.map(async span => ({
                timespan: span,
                stats: await generateApmLeaderboard(gameId as string, span)
            }))
        );

        // Check if client wants JSON
        if (contentType.includes('application/json')) {
            res.status(200).json(allStats);
        } else {
            // Default to HTML response
            let output = '<h2>APM Leaderboard</h2>';
            output += `<p>(Max APM in rolling windows)</p>`;
            output += '<style>';
            output += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
            output += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
            output += 'th { background-color: #f2f2f2; }';
            output += 'tr:nth-child(even) { background-color: #f9f9f9; }';
            output += 'tr:hover { background-color: #f1f1f1; }';
            output += '</style>';

            // Create a table with columns for each timespan
            output += '<table>';
            output += '<tr><th>Rank</th><th>Player</th>';
            allStats.forEach(statGroup => {
                output += `<th>${statGroup.timespan}s APM</th>`;
            });
            output += '</tr>';

            // Create a combined player list from all timespans
            const allPlayers = new Set<string>();
            allStats.forEach(statGroup => {
                statGroup.stats.forEach(stat => {
                    allPlayers.add(stat[0]);
                });
            });

            // Create a map of player scores for each timespan
            const playerScores: Record<string, Record<number, number>> = {};
            allStats.forEach(statGroup => {
                statGroup.stats.forEach(stat => {
                    if (!playerScores[stat[0]]) {
                        playerScores[stat[0]] = {};
                    }
                    playerScores[stat[0]][statGroup.timespan] = stat[1];
                });
            });

            // Get the highest timespan for sorting
            const highestTimespan = timespans[timespans.length - 1];

            // Sort players by their score in the highest timespan
            const sortedPlayers = Array.from(allPlayers).sort((a, b) => {
                const aScore = playerScores[a][highestTimespan] || 0;
                const bScore = playerScores[b][highestTimespan] || 0;
                return bScore - aScore;
            });

            // Add rows for each player
            sortedPlayers.forEach((player, index) => {
                output += `<tr><td>${index + 1}</td><td>${player}</td>`;
                allStats.forEach(statGroup => {
                    const score = playerScores[player][statGroup.timespan] || 0;
                    output += `<td>${score}</td>`;
                });
                output += '</tr>';
            });

            output += '</table>';

            res.status(200).send(output);
        }
    } catch (error) {
        res.status(400).json({ message: `Error getting apm data: ${error}` });
    }
}

export async function getTileLeaderboard(req: Request, res: Response) {
    try {
        const { gameId } = req.query;
        const contentType = req.headers['accept'] || 'text/html';

        const stats = await generateTileLeaderboard(gameId as string);

        // Check if client wants JSON
        if (contentType.includes('application/json')) {
            res.status(200).json(stats);
        } else {
            // Default to HTML response
            let output = '<h2>Tile Ownership Leaderboard</h2>';
            output += '<p>(Maximum concurrent tiles captured by the player)</p>';
            output += '<style>';
            output += 'table { border-collapse: collapse; width: 100%; }';
            output += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
            output += 'th { background-color: #f2f2f2; }';
            output += 'tr:nth-child(even) { background-color: #f9f9f9; }';
            output += 'tr:hover { background-color: #f1f1f1; }';
            output += '</style>';
            output += '<table>';
            output += '<tr><th>Rank</th><th>Player</th><th>Tiles Captured</th><th>Percentage</th></tr>';
            stats.forEach((stat, index) => {
                output += `<tr><td>${index + 1}</td><td>${stat[0]}</td><td>${stat[1]}</td><td>${stat[2]}</td></tr>`;
            });
            output += '</table>';

            res.status(200).send(output);
        }
    } catch (error) {
        res.status(400).json({ message: `Error getting tile data: ${error}` });
    }
}

export async function getAvailableGames(req: Request, res: Response) {
    try {
        res.status(200).send(await getAvailableGameIds());
    } catch (error) {
        res.status(400).json({ message: `Error: ${error}` });
    }
}

export async function getGameTimespan(req: Request, res: Response) {
    try {
        const { gameId } = req.query;

        res.status(200).send(await getTimespan(gameId as string));
    } catch (error) {
        res.status(400).json({ message: `Error: ${error}` });
    }
}

export async function getGameConfig(req: Request, res: Response) {
    try {
        const { gameId } = req.query;

        res.status(200).send(await getConfig(gameId as string));
    } catch (error) {
        res.status(400).json({ message: `Error: ${error}` });
    }
}

export async function allActivities(req: Request, res: Response) {
    try {
        const { gameId } = req.query;
        let whereQuery: WhereOptions<InferAttributes<ActivitiesModel>> = {
            game_id: gameId as string
        };
        res.status(200).send(await getAllActivities(whereQuery));
    } catch (error) {
        res.status(400).json({ message: `Error: ${error}` });
    }
}

export async function getPlayerActionCounts(req: Request, res: Response) {
    try {
        const { gameId, types } = req.query;

        if (!gameId || !types) {
            res.status(400).json({ message: 'Missing required parameters: gameId and types' });
            return;
        }

        // Parse types from query string (expecting comma-separated values)
        const typesArray = (types as string).split(',');

        const actionCounts = await generatePlayerActionCounts(gameId as string, typesArray);

        // Check Accept header to determine response format
        if (req.accepts('html')) {
            let output = '<table border="1"><tr><th>Player</th><th>Action Count</th></tr>';

            for (const count of actionCounts) {
                output += `<tr><td>${count.player_name}</td><td>${count.actions}</td></tr>`;
            }

            output += '</table>';
            res.status(200).send(output);
        } else {
            res.status(200).json(actionCounts);
        }
    } catch (error) {
        res.status(400).json({ message: `Error getting player action counts: ${error}` });
    }
}

export async function getActivePlayers(req: Request, res: Response) {
    try {
        const { gameId } = req.query;

        if (!gameId) {
            res.status(400).json({ message: 'Missing required parameter: gameId' });
            return;
        }

        const players = await getAllActivePlayers(gameId as string);
        res.status(200).json(players);
    } catch (error) {
        res.status(400).json({ message: `Error getting active players: ${error}` });
    }
}

export async function getResourcesSentLeaderboard(req: Request, res: Response) {
    try {
        const { gameId } = req.query;
        const contentType = req.headers['accept'] || 'text/html';

        if (!gameId) {
            res.status(400).json({ message: 'Missing required parameter: gameId' });
            return;
        }

        const stats = await generateResourcesSentLeaderboard(gameId as string);

        // Check if client wants JSON
        if (contentType.includes('application/json')) {
            res.status(200).json(stats);
        } else {
            // Default to HTML response
            let output = '<h2>Resources Sent Leaderboard</h2>';
            output += '<p>(Total resources sent by player with breakdown by recipient)</p>';
            output += '<style>';
            output += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
            output += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
            output += 'th { background-color: #f2f2f2; }';
            output += 'tr:nth-child(even) { background-color: #f9f9f9; }';
            output += 'tr:hover { background-color: #f1f1f1; }';
            output += '.recipient-table { display: none; margin-top: 10px; }';
            output += '.recipient-table.show { display: table; }';
            output += '.toggle-btn { background: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; }';
            output += '.toggle-btn:hover { background: #0056b3; }';
            output += '</style>';
            output += '<script>';
            output += 'function toggleRecipients(playerIndex) {';
            output += '  const table = document.getElementById("recipients-" + playerIndex);';
            output += '  const btn = document.getElementById("btn-" + playerIndex);';
            output += '  if (table.classList.contains("show")) {';
            output += '    table.classList.remove("show");';
            output += '    btn.textContent = "Show Recipients";';
            output += '  } else {';
            output += '    table.classList.add("show");';
            output += '    btn.textContent = "Hide Recipients";';
            output += '  }';
            output += '}';
            output += '</script>';
            output += '<table>';
            output += '<tr><th>Rank</th><th>Player</th><th>Total Resources</th><th>Total Iron</th><th>Total Wood</th><th>Recipients</th></tr>';
            
            stats.forEach((stat, index) => {
                output += `<tr><td>${index + 1}</td><td>${stat.player}</td><td>${stat.totalResources}</td><td>${stat.totalIron}</td><td>${stat.totalWood}</td><td>`;
                
                // Add recipient breakdown
                const recipients = Object.entries(stat.recipients);
                if (recipients.length > 0) {
                    output += `<button id="btn-${index}" class="toggle-btn" onclick="toggleRecipients(${index})">Show Recipients</button>`;
                    output += `<table id="recipients-${index}" class="recipient-table">`;
                    output += '<tr><th>Recipient</th><th>Iron</th><th>Wood</th><th>Total</th></tr>';
                    recipients.forEach(([recipient, resources]) => {
                        const typedResources = resources as { iron: number, wood: number };
                        const total = typedResources.iron + typedResources.wood;
                        output += `<tr><td>${recipient}</td><td>${typedResources.iron}</td><td>${typedResources.wood}</td><td>${total}</td></tr>`;
                    });
                    output += '</table>';
                } else {
                    output += 'None';
                }
                
                output += '</td></tr>';
            });
            output += '</table>';

            res.status(200).send(output);
        }
    } catch (error) {
        res.status(400).json({ message: `Error getting resources sent data: ${error}` });
    }
}

export async function getResourcesReceivedLeaderboard(req: Request, res: Response) {
    try {
        const { gameId } = req.query;
        const contentType = req.headers['accept'] || 'text/html';

        if (!gameId) {
            res.status(400).json({ message: 'Missing required parameter: gameId' });
            return;
        }

        const stats = await generateResourcesReceivedLeaderboard(gameId as string);

        // Check if client wants JSON
        if (contentType.includes('application/json')) {
            res.status(200).json(stats);
        } else {
            // Default to HTML response
            let output = '<h2>Resources Received Leaderboard</h2>';
            output += '<p>(Total resources received by player with breakdown by sender)</p>';
            output += '<style>';
            output += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
            output += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
            output += 'th { background-color: #f2f2f2; }';
            output += 'tr:nth-child(even) { background-color: #f9f9f9; }';
            output += 'tr:hover { background-color: #f1f1f1; }';
            output += '.sender-table { display: none; margin-top: 10px; }';
            output += '.sender-table.show { display: table; }';
            output += '.toggle-btn { background: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; }';
            output += '.toggle-btn:hover { background: #0056b3; }';
            output += '</style>';
            output += '<script>';
            output += 'function toggleSenders(recipientIndex) {';
            output += '  const table = document.getElementById("senders-" + recipientIndex);';
            output += '  const btn = document.getElementById("btn-" + recipientIndex);';
            output += '  if (table.classList.contains("show")) {';
            output += '    table.classList.remove("show");';
            output += '    btn.textContent = "Show Senders";';
            output += '  } else {';
            output += '    table.classList.add("show");';
            output += '    btn.textContent = "Hide Senders";';
            output += '  }';
            output += '}';
            output += '</script>';
            output += '<table>';
            output += '<tr><th>Rank</th><th>Player</th><th>Total Resources</th><th>Total Iron</th><th>Total Wood</th><th>Senders</th></tr>';
            
            stats.forEach((stat, index) => {
                output += `<tr><td>${index + 1}</td><td>${stat.recipient}</td><td>${stat.totalResources}</td><td>${stat.totalIron}</td><td>${stat.totalWood}</td><td>`;
                
                // Add sender breakdown
                const senders = Object.entries(stat.senders);
                if (senders.length > 0) {
                    output += `<button id="btn-${index}" class="toggle-btn" onclick="toggleSenders(${index})">Show Senders</button>`;
                    output += `<table id="senders-${index}" class="sender-table">`;
                    output += '<tr><th>Sender</th><th>Iron</th><th>Wood</th><th>Total</th></tr>';
                    senders.forEach(([sender, resources]) => {
                        const typedResources = resources as { iron: number, wood: number };
                        const total = typedResources.iron + typedResources.wood;
                        output += `<tr><td>${sender}</td><td>${typedResources.iron}</td><td>${typedResources.wood}</td><td>${total}</td></tr>`;
                    });
                    output += '</table>';
                } else {
                    output += 'None';
                }
                
                output += '</td></tr>';
            });
            output += '</table>';

            res.status(200).send(output);
        }
    } catch (error) {
        res.status(400).json({ message: `Error getting resources received data: ${error}` });
    }
}