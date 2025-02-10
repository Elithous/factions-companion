import express, { Request, Response } from 'express';
import { generateSoldierStatsByFaction, generateSoldierStatsByTile } from "../services/reports/activityReport.service";
import { getAvailableGameIds } from '../services/reports/gameReport.service';
import { WhereOptions, InferAttributes } from 'sequelize';
import { WorldUpdateModel } from '../models/activities/worldUpdate.model';

export async function getSoldierStatsByFaction(req: Request, res: Response) {
    try {
        const { gameId, playerName, tileX, tileY, fromFaction } = req.query;
        let whereQuery: WhereOptions<InferAttributes<WorldUpdateModel>> = {
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
        const stats = await generateSoldierStatsByFaction(whereQuery);

        res.status(200).send(stats);
    } catch (error) {
        res.status(400).json({ message: `Error getting soldier data: ${error}` });
    }
}

export async function getSoliderStatsByTile(req: Request, res: Response) {
    try {
        const { gameId, playerName, fromFaction } = req.query;
        let whereQuery: WhereOptions<InferAttributes<WorldUpdateModel>> = {
            game_id: gameId as string
        };
        if (playerName) {
            whereQuery.player_name = playerName as string;
        }
        if (fromFaction) {
            whereQuery.player_faction = fromFaction as string;
        }
        const stats = await generateSoldierStatsByTile(whereQuery);

        res.status(200).send(stats);
    } catch (error) {
        res.status(400).json({ message: `Error getting soldier data: ${error}` });
    }
}

export async function getAvailableGames(req: Request, res: Response) {
    try {
        res.status(200).send(await getAvailableGameIds());
    } catch (error) {
        res.status(400).json({ message: `Error setting up game watch: ${error}` });
    }
}