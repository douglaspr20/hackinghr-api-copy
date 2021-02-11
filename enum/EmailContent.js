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
    Please connect in this link at the time of the event: <a target="_blank" href="${event.link}">${event.link}</a>
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
};
