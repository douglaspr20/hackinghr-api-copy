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
    Please connect in this link at the time of the event: <a target="_blank" href="${
      event.link || ""
    }">${event.link || ""}</a>
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
    <p>Hi!</P
    <p>Your friend ${user.firstName} ${user.lastName} is inviting you to join Hacking HR LAB! Please join here: <a target="_blank" href="${process.env.DOMAIN_URL}join">${process.env.DOMAIN_URL}join</a></p>
    <p>Hacking HR LAB is a one-stop shop to support the growth, development and advancement of HR professionals. Some of the feature it includes:<p>
    <ul>
      <li>A powerful and dynamic learning library</li>
      <li>Conference Library with the videos from our global events</li>
      <li>A comprehensive event calendar (Both for Hacking HR and partner events)</li>
      <li>Mentoring</li>
      <li>Learning Journeys to achieve learning objectives leveraging Adaptive Learning approaches</li>
      <li>Many more features coming up.</li>
    </ul>
    <p>Join us! Create your FREE account today: <a target="_blank" href="${process.env.DOMAIN_URL}join">${process.env.DOMAIN_URL}join</a></p>
    <br />
    Thank you! 
    <br />
    The Hacking HR Team
    <br/>
  `,
  CLAIM_EMAIL: (user, event) => `
    Hi, ${user.firstName},
    <br/>
    Were you able to attend our ${event.title} event?
    <br/>
    <br/>
    If so, please go back to the Hacking HR LAB, click on Events and My Past Events, and certify your attendance.
    <br/>
    <br/>
    As a PREMIUM member you can claim a Hacking HR certificate of participation. Use this code when prompted in the system: ${event.code}.
    <br/>
    <br/>
    If the event was conducive to SHRM and/or HRCI recertification credits, you will be able to see them on screen when entering the code above.
    <br/>
    <br/>
    Thank you! We hope to see you in many more events!
    <br/>
    Hacking HR Team
  `,
  NEW_RESOURCE_EMAIL: (user, resource) => `
      Hi, ${user.firstName},
      <br />
      Resource Link: ${resource.resourceLink}
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      Hacking HR Team
  `,
};
