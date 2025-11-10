import { 
  addDays, 
  differenceInCalendarDays, 
  formatISO, 
  parseISO, 
  isValid 
} from 'date-fns';

export default function calculatePhaseDeadlines(
  phases = [], 
  overallDeadline, 
  startDate = new Date()
) {
  if (!Array.isArray(phases) || phases.length === 0) return [];

  // 1️⃣ Parse and validate dates
  let finalDeadline = overallDeadline instanceof Date ? overallDeadline : parseISO(overallDeadline);
  const start = startDate instanceof Date ? startDate : parseISO(startDate);

  if (!isValid(finalDeadline)) throw new Error('Invalid overallDeadline provided');
  if (!isValid(start)) throw new Error('Invalid startDate provided');

  // Ensure at least 1 day window
  if (differenceInCalendarDays(finalDeadline, start) < 1) {
    finalDeadline = addDays(start, 7);
  }

  const totalDays = differenceInCalendarDays(finalDeadline, start);
  const totalEffort = phases.reduce((sum, phase) => sum + (phase.estimatedEffort || 10), 0);

  let accumulatedDays = 0;
  const phasesWithDeadlines = [];

  // 2️⃣ Iterate and compute each phase
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const effort = phase.estimatedEffort || 10;
    let phaseDuration = Math.round(totalDays * (effort / totalEffort));

    // Ensure minimum 1 day
    phaseDuration = Math.max(1, phaseDuration);

    // Adjust rounding: last phase takes remaining days
    if (i === phases.length - 1) {
      phaseDuration = totalDays - accumulatedDays;
    }

    const phaseStartDate = addDays(start, accumulatedDays);
    accumulatedDays += phaseDuration;
    let phaseEndDate = addDays(start, accumulatedDays);

    // Clamp final phase
    if (phaseEndDate > finalDeadline) phaseEndDate = finalDeadline;

    // 3️⃣ Compute tasks inside the phase
    const phaseTasks = (phase.tasks || []);
    const taskEffortSum = phaseTasks.reduce((s, t) => s + (t.estimatedEffort || 1), 0);
    const phaseDurationDays = differenceInCalendarDays(phaseEndDate, phaseStartDate);

    const tasksWithDeadlines = phaseTasks.map((task, idx) => {
      const taskEffort = task.estimatedEffort || 1;
      const proportion = taskEffort / taskEffortSum;
      const taskEnd = addDays(phaseStartDate, Math.ceil(phaseDurationDays * proportion * (idx + 1)));

      return {
        ...task,
        startDate: formatISO(phaseStartDate, { representation: 'date' }),
        dueDate: formatISO(taskEnd, { representation: 'date' }),
        status: task.status || 'TODO'
      };
    });

    // 4️⃣ Push final structured phase
    phasesWithDeadlines.push({
      ...phase,
      phaseStartDate: formatISO(phaseStartDate, { representation: 'date' }),
      phaseEndDate: formatISO(phaseEndDate, { representation: 'date' }),
      status: phase.status || 'TODO',
      tasks: tasksWithDeadlines
    });
  }

  return phasesWithDeadlines;
}
