export type TriggerKey =
  | 'onStart'
  | 'fallingBehind'
  | 'backOnPace'
  | 'halfwayPoint'
  | 'finalStretch';

// Message bank: 3 messages × 5 intensity levels per trigger = 75 total
// Intensity 1 = calm/encouraging, 5 = aggressive/intense

export const motivationMessages: Record<
  TriggerKey,
  Record<1 | 2 | 3 | 4 | 5, string[]>
> = {
  onStart: {
    1: [
      'All right, let\'s get moving. Nice and smooth.',
      'Run begins. Trust your training.',
      'Here we go. Settle into your rhythm.',
    ],
    2: [
      'Start strong. Set the tone for this run.',
      'Let\'s go. Every mile starts with one step.',
      'You\'ve prepared for this. Make it count.',
    ],
    3: [
      'Starting now. Lock in that pace and let\'s work.',
      'Go time. Hit your target and hold it.',
      'Run started. Stay focused — this is race simulation.',
    ],
    4: [
      'Move! Get on pace right now. No wasted steps.',
      'Let\'s go — attack this run from the first stride.',
      'On pace or ahead of pace. Nothing less. Go!',
    ],
    5: [
      'MOVE. Hit that pace immediately. Go hard.',
      'This is your race. Dominate every single mile. GO.',
      'Run like you mean it. Compete with yourself. NOW.',
    ],
  },
  fallingBehind: {
    1: [
      'Pace is a bit slow. Gently bring it up.',
      'You\'re off pace. Easy adjustment — pick it up a touch.',
      'Slightly behind. Focus on your stride and push a little.',
    ],
    2: [
      'You\'re falling behind target pace. Time to accelerate.',
      'Off pace now. Lift your knees and push forward.',
      'Behind pace. Don\'t panic — just surge and close the gap.',
    ],
    3: [
      'You\'re behind! Pick up the pace — close that gap now.',
      'Falling behind! Push harder. Get back to target.',
      'Behind pace. Drive your arms, lengthen your stride, go.',
    ],
    4: [
      'You\'re LOSING time. Fix your pace RIGHT NOW.',
      'Behind pace! Stop drifting — push hard and get back.',
      'Gap is growing. Attack. Get back on pace NOW.',
    ],
    5: [
      'FALLING BEHIND. PUSH. NO EXCUSES. GO FASTER.',
      'You\'re losing this race right now. CATCH UP. MOVE.',
      'BEHIND PACE. DRIVE. HURT. GET BACK. NOW.',
    ],
  },
  backOnPace: {
    1: [
      'Good, you\'re back on pace. Smooth sailing.',
      'Nice work — pace is right where it needs to be.',
      'You corrected it. Stay here and hold your form.',
    ],
    2: [
      'Back on target. Strong adjustment — keep it there.',
      'You caught up. Good work. Don\'t let it slip again.',
      'Pace is back. Breathe and lock in.',
    ],
    3: [
      'You\'re back on pace! Great push. Hold this effort.',
      'Back on target. That surge worked — maintain it.',
      'Pace restored. Stay disciplined and keep hammering.',
    ],
    4: [
      'Back on pace! That\'s what you needed. Stay aggressive.',
      'Closed the gap! Don\'t back off — keep the pressure on.',
      'On pace again. Stay on the gas. Do NOT slip back.',
    ],
    5: [
      'BACK ON PACE. That\'s it. STAY HERE. FIGHT FOR IT.',
      'You clawed it back! Now OWN that pace. Don\'t give it up.',
      'CAUGHT UP. Stay locked in. No mercy — race yourself.',
    ],
  },
  halfwayPoint: {
    1: [
      'Halfway there. You\'ve earned a moment to relax and reload.',
      'Midpoint reached. Check your form and keep going strong.',
      'Fifty percent done. Second half is yours — run it well.',
    ],
    2: [
      'Halfway! You\'re in great shape. Stick to the plan.',
      'Midpoint. Half the work is done — now do it again.',
      'Halfway mark. Take stock, lock in, and push through.',
    ],
    3: [
      'Halfway! Now it\'s time to compete. Make the second half count.',
      'Midpoint — stop surviving, start racing. Pick it up.',
      'Half done. Dig in. This is where races are won.',
    ],
    4: [
      'HALFWAY. Time to go. Second half is faster. Push NOW.',
      'Half done! The next half decides everything. Attack it.',
      'Midpoint — turn it up. Run through the finish line.',
    ],
    5: [
      'HALFWAY. GO. EVERY STEP HARDER THAN THE LAST. RACE.',
      'HALF. THE WORK STARTS NOW. PUSH THROUGH THE PAIN.',
      'MIDPOINT. I WANT YOUR BEST. GO HARD. ALL OF IT.',
    ],
  },
  finalStretch: {
    1: [
      'Almost there. Just a little more. You\'ve got this.',
      'Final stretch. Stay smooth and bring it home.',
      'So close. Relax your shoulders and keep your rhythm.',
    ],
    2: [
      'Final stretch! You\'re almost done — dig in a bit more.',
      'Nearly there. One final push and you\'re across the line.',
      'Last bit now. Run strong all the way through.',
    ],
    3: [
      'FINAL STRETCH! Give it everything. Don\'t hold back now.',
      'Almost done! Lift your knees, surge, and finish hard.',
      'Last 15 percent! Run through the line. Finish it.',
    ],
    4: [
      'LAST STRETCH. GO ALL OUT. NOTHING LEFT IN THE TANK.',
      'Sprint to that finish. Empty yourself. No regrets.',
      'FINAL PUSH. Run harder than you think you can.',
    ],
    5: [
      'GO GO GO. FINAL STRETCH. EVERYTHING YOU HAVE. NOW.',
      'SPRINT. SUFFER. FINISH. NO MORE HOLDING BACK. GO.',
      'THIS IS IT. RACE. HURT. FINISH. LEAVE IT ALL OUT THERE.',
    ],
  },
};

export function getMotivationMessage(
  trigger: TriggerKey,
  intensity: 1 | 2 | 3 | 4 | 5
): string {
  const messages = motivationMessages[trigger][intensity];
  return messages[Math.floor(Math.random() * messages.length)];
}
