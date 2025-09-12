import { addDays, differenceInCalendarDays, formatISO, parseISO, isValid } from 'date-fns';

export default function calculatePhaseDeadlines(phases, overallDeadline, startDate = new Date()) {
    // 1. Parse and validate overallDeadline and startDate
    let finalDeadline = overallDeadline instanceof Date ? overallDeadline : parseISO(overallDeadline);
    const start = startDate instanceof Date ? startDate : parseISO(startDate);

    if (!isValid(finalDeadline)) {
        throw new Error('Invalid overallDeadline provided');
    }
    if (!isValid(start)) {
        throw new Error('Invalid startDate provided');
    }

    // Fallback: Ensure deadline is at least 1 day in the future
    if (differenceInCalendarDays(finalDeadline, start) < 1) {
        finalDeadline = addDays(start, 7);
    }

    const totalDays = differenceInCalendarDays(finalDeadline, start);
    const totalEffort = phases.reduce((sum, phase) => sum + (phase.estimatedEffort || 10), 0);

    let accumulatedDays = 0;

    // 2. Iterate and calculate deadlines for each phase
    const phasesWithDeadlines = phases.map((phase, index) => {
        const effort = phase.estimatedEffort || 10;
        let phaseDuration = Math.round(totalDays * (effort / totalEffort));
        phaseDuration = Math.max(1, phaseDuration); // At least 1 day per phase

        accumulatedDays += phaseDuration;

        // Calculate phase due date
        let phaseDueDate = addDays(start, accumulatedDays);

        // Last phase matches overall deadline
        if (index === phases.length - 1) {
            phaseDueDate = finalDeadline;
        }

        // Clamp to overall deadline
        if (phaseDueDate > finalDeadline) {
            phaseDueDate = finalDeadline;
        }

        // Determine phase start date
        let phaseStartDate;
        if (index === 0) {
            phaseStartDate = start;
        } else {
            const prevDue = phases[index - 1]?.dueDate;
            if (typeof prevDue === 'string') {
                phaseStartDate = parseISO(prevDue);
            } else if (prevDue instanceof Date) {
                phaseStartDate = prevDue;
            } else {
                phaseStartDate = start;
            }
        }

        // Calculate task deadlines within phase
        const tasksWithDeadlines = (phase.tasks || []).map((task, taskIndex) => {
            const taskDuration = differenceInCalendarDays(phaseDueDate, phaseStartDate);
            const taskDueDate = addDays(
                phaseStartDate,
                Math.ceil(((taskIndex + 1) / (phase.tasks.length || 1)) * taskDuration)
            );

            if (!isValid(taskDueDate)) {
                throw new Error(`Invalid taskDueDate for task "${task.name}" in phase "${phase.name}"`);
            }

            return {
                ...task,
                dueDate: formatISO(taskDueDate, { representation: 'date' }), // 'YYYY-MM-DD'
                status: 'TODO'
            };
        });

        return {
            ...phase,
            dueDate: formatISO(phaseDueDate, { representation: 'date' }), // 'YYYY-MM-DD'
            status: 'TODO',
            tasks: tasksWithDeadlines
        };
    });

    return phasesWithDeadlines;
}
