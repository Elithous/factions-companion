"use client";

import { Paper, Stack, Text, Tooltip } from '@mantine/core';
import { useRef, useState, useCallback, useEffect } from 'react';

interface TimelineStep {
  id: number;
  type: 'build' | 'upgrade' | 'delete';
  buildingName: string;
  fromLevel?: number;
  toLevel?: number;
  imageUrl?: string;
}

interface BuildTimelineProps {
  timelineSteps: {
    type: 'building_built' | 'building_upgraded' | 'building_destroyed' | 'hq_upgraded';
    name: string;
    level: number;
    timestamp: number;
  }[] | undefined,
  currentStep: number;
  onStepChange: (step: number) => void;
}

const BOX_WIDTH = 40; // Fixed width for each timeline box

export default function BuildTimeline({ timelineSteps, currentStep, onStepChange }: BuildTimelineProps) {
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScroll, setDragStartScroll] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);

  useEffect(() => {
    if (!timelineSteps?.length) {
      setTimeline([]);
      return;
    }

    let id = 0;
    const timeline: TimelineStep[] = timelineSteps.map((step) => {
      let type: 'build' | 'upgrade' | 'delete' | null = null;
      if (step.type === 'building_built') {
        type = 'build';
      } else if (step.type === 'building_upgraded' || step.type === 'hq_upgraded') {
        type = 'upgrade';
      } else if (step.type === 'building_destroyed') {
        type = 'delete';
      }
      if (!type) return null;
      const result: any = { id: id++, type, buildingName: step.name };
      if (type === 'build') result.toLevel = step.level;
      if (type === 'upgrade') {
        result.fromLevel = step.level - 1;
        result.toLevel = step.level;
      }
      return result;
    }).filter(Boolean) as TimelineStep[];
    setTimeline(timeline);
  }, [timelineSteps])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!timelineContainerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScroll(timelineContainerRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineContainerRef.current) return;
    const deltaX = dragStartX - e.clientX;
    const newScrollLeft = dragStartScroll + deltaX;
    timelineContainerRef.current.scrollLeft = Math.max(
      0,
      Math.min(newScrollLeft, timelineContainerRef.current.scrollWidth - timelineContainerRef.current.clientWidth)
    );
  }, [isDragging, dragStartX, dragStartScroll]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!timelineContainerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const container = timelineContainerRef.current;
    // Convert vertical scroll to horizontal scroll
    container.scrollLeft += e.deltaY;
  }, []);

  // Add wheel event listener to prevent page scroll
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Center the current step when it changes
  useEffect(() => {
    if (!timelineContainerRef.current) return;
    const container = timelineContainerRef.current;
    const centerX = container.clientWidth / 2;
    // first box is at position '0', each subsequent box is BOX_WIDTH further
    const targetScrollLeft = (currentStep * BOX_WIDTH) - centerX + (BOX_WIDTH / 2);
    const maxScroll = container.scrollWidth - container.clientWidth;

    container.scrollTo({
      left: Math.max(0, Math.min(targetScrollLeft, maxScroll)),
      behavior: 'smooth'
    });
  }, [currentStep]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getStepDisplayText = (step: TimelineStep): string => {
    switch (step.type) {
      case 'build':
        return `Built ${step.buildingName}`;
      case 'upgrade':
        return `Upgraded ${step.buildingName || 'HQ'} Level ${step.fromLevel} -> ${step.toLevel}`;
      case 'delete':
        return `Deleted ${step.buildingName}`;
      default:
        return step.buildingName;
    }
  };

  const getStepIcon = (type: TimelineStep['type']): string => {
    switch (type) {
      case 'build':
        return '+';
      case 'upgrade':
        return '✓';
      case 'delete':
        return '✕';
      default:
        return '○';
    }
  };

  const getStepColor = (type: TimelineStep['type']): string => {
    switch (type) {
      case 'build':
      case 'upgrade':
        return '#51cf66'; // green
      case 'delete':
        return '#ff6b6b'; // red
      default:
        return '#868e96'; // gray
    }
  };

  return (
    <Paper p="md" withBorder className="build-timeline-container">
      <Stack gap="md">
        {/* Timeline Bar */}
        <div
          ref={timelineContainerRef}
          className="timeline-bar-container"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            height: `${BOX_WIDTH}px`,
            paddingBottom: '55px'
          }}
        >
          <div
            ref={timelineContentRef}
            className="timeline-bar-content"
            style={{
              width: `${timeline.length * BOX_WIDTH}px`,
              position: 'relative',
              height: `${BOX_WIDTH}px`,
            }}
          >
            {/* Timeline Steps */}
            { timeline.map((step, index) => {
              const isActive = index === currentStep;
              const isHovered = index === hoveredStep;

              return (
                <Tooltip
                  key={index}
                  label={step ? getStepDisplayText(step) : `Step ${index + 1}`}
                  position="top"
                  disabled={!step}
                >
                  <div
                    className={`timeline-step ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${index * BOX_WIDTH}px`,
                      width: `${BOX_WIDTH}px`,
                      height: `${BOX_WIDTH}px`,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: step ? getStepColor(step.type) : 'rgba(134, 142, 150, 0.3)',
                      opacity: isActive ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStepChange(index);
                    }}
                  >
                    {step && (
                      <Text size="xs" c="white" fw={700}>
                        {getStepIcon(step.type)}
                      </Text>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </Stack>
    </Paper>
  );
}

