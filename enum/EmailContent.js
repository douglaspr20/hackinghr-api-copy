module.exports = {
  MENTOR_EMAIL: (source, target) => `
    <p>
      Hi, ${source.firstName} and ${target.firstName}, 
    </p>
      ${source.firstName}, you are interested in mentoring ${target.firstName}, based on both your interests.
    <p>
      We wanted to connect you both and let you take it from here.
    </p>
    <p>
      Thank you!
      <br />
      Hacking HR Team.
    </p>
  `,
  MENTEE_EMAIL: (source, target) => `
    <p>
      Hi, ${source.firstName} and ${target.firstName}, 
    </p>
    <p>
      ${source.firstName}, you are interested in becoming a mentee of ${target.firstName}, based on both your interests.
    </p>
    <p>
      We wanted to connect you both and let you take it from here.
    </p>
    <p>
      Thank you!
      <br />
      Hacking HR Team.
    </p>
  `,
  EVENT_ATTEND_EMAIL: (user, event, getEventPeriod) => `
    <p>
    Hi, ${user.firstName}
    </p>
    <p>
    Thank you for registering for ${event.title} organized by ${event.organizer}
    <br/>
    <br/>
    We look forward to seeing you on ${getEventPeriod(
      event.startDate,
      event.endDate,
      event.timezone
    )}. 
    </p>
    <p>
    Please connect in this link at the time of the event: <a target="_blank" href="${event.link || ""}">${event.link || ""}</a>
    </p>
    <p>
    Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
    <br />
    </p>
    Thank you! 
    <br />
    Hacking HR Team
    <br/>
  `,
  INVITE_EMAIL: (user) => `
  <p>Hi, your friend ${user.firstName} is inviting you to join Hacking HR LAB! Please follow this <a target="_blank" href="https://www.hackinghrlab.io/">link</a> to check it out!</p>
  <p>Hacking HR LAB is a one-stop shop for mentoring, peer-to-peer coaching and learning. It includes:<p>
  <ul>
    <li>A powerful and dynamic learning library</li>
    <li>A comprehensive event calendar (Both for Hacking HR and partner events)</li>
    <li>Mentoring and peer-to-peer coaching functionalities</li>
    <li>A LAB for collaborative problem-solving</li>
    <li>A HUB for policy/process collaborative design</li>
    <li>Peer-to-peer assessed evaluations for certifications and micro-credentials</li>
    <li>Learning Journeys to achieve learning objectives leveraging Adaptive Learning approaches</li>
  </ul>
  <p>Come form part of the HR of the Future!</p>
  <br />
  The Hacking HR Team
  `
};
