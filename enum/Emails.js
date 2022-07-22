module.exports = {
  NEW_USER_SIGNUP: {
    subject: () => `WOW! You are in the Hacking HR LAB! THANK YOU!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      Thank you so much for joining the Hacking HR LAB!
      </p>
      <p>
      Check out all the tools we have available here: <a href="https://www.hackinghrlab.io/join">https://www.hackinghrlab.io/join</a>
      </p>
      <p>
      I have to say: how cool and awesome is to have you in this platform. We built it for you… and you made it! THANK YOU.
      </p>
      <p>
      We have a bunch of great features and content for you. And we are working nonstop in product development and improvement. That means that you will be seeing changes and a lot of more value every time you log in.
      </p>
      <p>
      If you think this is a good place for you to invest some money, please become a PREMIUM member for $119 a year. Just click on UPGRADE. You will get access to EVERYTHING. And when I say EVERYTHING, I mean everything that we have now and everything we will develop and deploy in the future.
      </p>
      <p>
      Well. Long email… 
      </p>
      <p>
      For now, THANK YOU for being here and do not hesitate to let me know about feedback, comments, ideas, questions, stories or anything else. I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
      </p>
      <p>
      THANK YOU!
      </p>
      <p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  USER_BECOME_PREMIUM: {
    subject: () => `Wowza! You are now a PREMIUM MEMBER of the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      It is… let me think… ok… WONDERFUL, AMAZING, AWESOME and GREAT that you became a PREMIUM member of the Hacking HR LAB!
      </p>
      <p>
      Thank you so much!
      </p>
      <p>
      You will now have access to all the PREMIUM tools we have available (including the new ones coming up!). Please make sure you use everything… thoroughly! There’s a lot of content and features for you.
      </p>
      <p>
      And PLEASE, like really PLEASE, if there is something that isn’t working properly (techy bugs… they happen!), something we can improve, or a tool that you’d love to see and we don’t have, just shoot me an email and let me know about it. I can’t promise that we will move faster than the speed of light (whoops that’s impossible!), but we are pretty fast to fix bugs, improve existing features and create new ones.
      </p>
      <p>
      I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a> and, as always, right at you service and honor to serve you!
      </p>
      <p>
      THANK YOU!
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  EVENT_REMINDER_24_HOURS: {
    subject: (event) => `${event.title} is coming up in one day!`,
    body: (user, event, startDate, startTime) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      We are so excited you are joining us at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      We look forward to seeing you on ${startDate} at ${startTime}.
      </p>
      <p>
      This is the link to connect: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  EVENT_REMINDER_45_MINUTES: {
    subject: (event) => `Almost here! Coming up in two hours: ${event.title}`,
    body: (user, event) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      The time has come!
      </p>
      <p>
      See you in two hours at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      Connect this link: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  PARTICIPANTS_LIST_TO_ORGANIZER: {
    subject: () => `PARTICIPANTS LIST`,
    body: (event, users) => `
      <h3>${event.title}</h3>
      <p>
      ${users
        .map((user) => {
          return `
          ${user.firstName} ${user.lastName},     ${user.email}
          <br />
      `;
        })
        .join("")}
      </p>
    `,
  },
  PODCAST_SERIES_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the podcast series "${title}"`,
    body: (user, podcastSeries) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Podcast Series "${podcastSeries.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        This podcast series awards:
      </p>
      <p>
        ${podcastSeries.hrCreditOffered}
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${podcastSeries.shrmCode}
        <br>
        <strong>HRCI: </strong>${podcastSeries.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more podcast series.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  LIBRARY_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the library "${title}"`,
    body: (user, library) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning into Hacking HR's Library content: "${library.title}".
      <p>
        We hope you enjoy the content. PLEASE share with your network!
      </p>
      <p>
        The HR recertification codes are:
        <br>
        <strong>SHRM: </strong>${library.shrmCode}
        <br>
        <strong>HRCI: </strong>${library.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you continue enjoying the content!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_CREDIT: {
    subject: (title) =>
      `Hacking HR's Event: "${title}" (HR recertification credits included)`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining the ${event.organizer}'s event: "${
      event.title
    }".
      <p>
        We hope you enjoyed the event!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      ${
        event.showClaim === 1
          ? `
            <p>
              The SHRM/HRCI codes for this event are:
              <br>
              <strong>SHRM: </strong>${event.shrmCode}
              <br>
              <strong>HRCI: </strong>${event.hrciCode}
            </p>
      `
          : ""
      }
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_ATTENDANCE: {
    subject: (title) => `Hacking HR's Event: ${title}`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining us at ${event.title} organized by ${event.organizer}.
      <p>
      <p>
        The HR attendance code is: ${event.code}
      </p>
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  COURSE_CLAIM: {
    subject: (title) => ` Thank you for participating in the course "${title}"`,
    body: (user, course) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Course "${course.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${course.shrmCode}
        <br>
        <strong>HRCI: </strong>${course.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more courses.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  BONFIRE_INVITATION: {
    subject: `You have been invited to a bonfire! A networking experience as part of the Hacking HR 2022 Global Online Conference`,
    body: (
      user,
      bonfire,
      bonfireCreator,
      startDate,
      startTime,
      endTime,
      timezone,
      googleLink,
      yahooLink
    ) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      You have been selected to join the bonfire "${bonfire.title}" on ${startDate} at ${startTime}-${endTime} (${timezone}), 
      created by ${bonfireCreator.firstName} ${bonfireCreator.lastName} (${bonfireCreator.email}).
      </p>
      <p>
      Bonfires are networking opportunities as part of the Hacking HR 2022 Global Online 
      Conference. Participants of the conference can create bonfires and we select a 
      group of other participants to join. Like a “professional blind date”! 
      </p>
      <p>
      This bonfire is about “${bonfire.description}” and you were invited because you have 
      interests that align with the topic of this conversation! 
      </p>
      <p>
      We hope you can join. 
      </p>
      <p>
      This is the link to connect: <a target="_blank" href="${bonfire.link}">${bonfire.link}</a>
      </p>
      <p>
      Attached a calendar invite including all details, just in case! 
      </p>
      <p>
      <a href="${googleLink}" target="_blank">Google Calendar</a>
      <br>
      <a href="${yahooLink}" target="_blank">Yahoo calendar</a>
      </p>
      <p>
      Happy networking! 
      </p>
      <br />
      <br />
      Hacking HR LAB
      <br/>
      <p>
      P.S.: Bonfires <b>ARE NOT</b> tools for sales or marketing pitches. If this happens during 
      your bonfire and the bonfire organizer is selling anything, marketing a product or 
      service, or using you for any purpose other than networking, please report it to us 
      (enrique@hackinghr.io). We will take immediate action.
      </p>
    `,
  },
  BONFIRE_CREATOR: {
    subject: `Thank you creating a Bonfire as part of the networking experience at the Hacking HR 2022 Global Online Conference`,
    body: (bonfireCreator, bonfire, startDate, startTime, timezone) => `
    <p>
    Hi, ${bonfireCreator.firstName}
    </p>
    <p>
    Thank you so much for creating the bonfire: "${bonfire.title}" on ${startDate} at ${startTime} (${timezone})
    </p>
    <p>
    <b>Quick note before moving on: time zones are always a headache for 
    everyone. PLEASE make sure that you entered the proper time zone when 
    creating your Bonfire. Thank you!.</b>
    </p>
    <p>
    You are so AWESOME!!! THANK YOU!
    </p>
    <p>
    We created Bonfires as a cool and valuable way for networking as part of the 
    Hacking HR 2022 Global Online Conference. We are thankful with you for creating 
    this space for meaningful conversation and networking.
    </p>
    <p>
    Based on areas of interest, we have selected 20 conference participants to join your
    bonfire and sent them the invitations via email. We hope they join! But please feel 
    free to promote as well in your network.
    </p>
    <p>
    Also, we added the bonfire in the “Bonfire” list in the <a href="https://www.hackinghrlab.io/global-conference">Conference application</a> 
    so that anyone can find it and join!
    </p>
    <p>
    One last thing: as the creator of the Bonfire you have a wonderful opportunity to 
    shape the conversation to be meaningful and valuable for those who join you. We 
    count on you to facilitate a wonderful space that is safe, respectful and tolerant, 
    and partisan political conversations or sales pitches are not allowed and 
    immediately stopped.
    </p>
    <p>Thank you so much!!!</p>
    <p>
    Happy networking! 
    </p>
    <br>
    <br>
    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hacking HR</p>
    <br>
    `,
  },
  BONFIRE_JOINING: {
    subject: `Thank you for joining a Bonfire as part of the networking experience at the Hacking HR 2022 Global Online Conference`,
    body: (
      user,
      bonfire,
      bonfireCreator,
      startDate,
      startTime,
      endTime,
      timezone,
      googleLink,
      yahooLink
    ) => `
    <p>
    Hi ${user.firstName}
    </p>
    <p>
    Thank you for joining the bonfire: “${bonfire.title}” on ${startDate} at ${startTime}-${endTime} (${timezone}), 
    created by ${bonfireCreator.firstName} ${bonfireCreator.lastName} (${bonfireCreator.email})!
    </p>
    <p>
    Bonfires are networking opportunities as part of the Hacking HR 2022 Global Online 
    Conference. Participants of the conference can create bonfires and we select a 
    group of other participants to join. Like a “professional blind date”! 
    </p>
    <p>
    This bonfire is about “${bonfire.description}” and you were invited because you have 
    interests that align with the topic of this conversation!
    </p>
    <p>
    This is the link to connect: ${bonfire.link}
    </p>
    <p>
    Attached a calendar invite including all details, just in case!
    </p>
    <p>
    <a href="${googleLink}" target="_blank">Google Calendar</a>
    <br>
    <a href="${yahooLink}" target="_blank">Yahoo calendar</a>
    </p>
    <br>
    <br>
    <p>
    Happy networking!
    </p>
    <br>
    <p>
    Hacking HR LAB
    </p>
    <br>
    <p>
    P.S.: Bonfires <b>ARE NOT</b> tools for sales or marketing pitches. If this happens during 
    your bonfire and the bonfire organizer is selling anything, marketing a product or 
    service, or using you for any purpose other than networking, please report it to us 
    (enrique@hackinghr.io). We will take immediate actio
    </p>
    `,
  },
  BONFIRE_DELETED: {
    subject: (bonfireTitle) => `"${bonfireTitle}" was deleted`,
    body: (user, bonfire, startDate, startTime, endTime, timezone) => `
    <p>
    Hi ${user.firstName}
    </p>
    <p>
    We are sorry to let you know that the bonfire: “${bonfire.title}” which was 
    scheduled for ${startDate} and ${startTime}-${endTime} (${timezone}) has been deleted by its creator. 
    </P>
    <p>
    Please visit the <a href="https://www.hackinghrlab.io/global-conference">Global Conference application</a> in the Hacking HR LAB and join other 
    bonfires. 
    </p>
    <br>
    <p>
    Thank you! 
    </p>
    <br>
    <p>
    Hacking HR LAB
    </p>
    `,
  },
  BONFIRE_EDITED: {
    subject: (bonfireTitle) => `"${bonfireTitle}" was edited`,
    body: (
      user,
      oldBonfireTitle,
      newBonfireinfo,
      startDate,
      startTime,
      endTime,
      timezone
    ) => `
    <p>
    Hi ${user.firstName}
    </p>
    <p>
    The bonfire: “${oldBonfireTitle}” has been edited. These are the new details: 
    </P>
    <p>${newBonfireinfo.title}</p>
    <p>${startDate}</p>
    <p>${startTime}-${endTime} (${timezone})</p>
    <p>${newBonfireinfo.link}</p>
    <br>
    <br>
    <p>
    Please make sure to update your calendar with the new details
    </p>
    <br>
    <p>Thank you and happy networking!</p>
    <p>
    Hacking HR LAB
    </p>
    `,
  },
  JOIN_COHORT_EMAIL: {
    subject: (cohort, startDate) => `
    Welcome to Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (user, cohort, startDate) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Welcome to Hacking HR's ProjectX!
    </p>  
    <p>
      We are so excited to have you join the cohort "${cohort.title}" starting on "${startDate}"!
    </p>
    <p>
    Our goal with ProjectX is to help you learn or improve your knowledge in the specific
    skill covered in COHORT NAME HERE through daily resources and personal 
    reflections.  
    </p>
    <p>
    This program is intense, but light touch: we will provide a daily resource that you 
    should be able to read, listen or watch in less than 20 minutes. Daily means daily: 
    66 consecutive days.
    </p>
    <p>
    Besides reading, listening or watching the daily resource, you will provide a 
    personal reflection about what you learned and how you plan to apply the lessons 
    learned.
    </p>
    <p>
    This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, 
    you will receive a daily resource and you must provide a reflection about the 
    resource. The reflection should address the question: “what did I learn from this 
    resource and how can I apply it in my day to day practice/work?”
    </p>
    <p>
    Reading, listening or watching the resource and providing the reflection shouldn’t 
    take more than 20-25 minutes per day... Hey, “excellence is a habit”... and we aim 
    to make light-touch learning a habit with discipline and commitment. 
    </p>
    <p>
    The program relies on daily consistency and discipline. Instead of bugging you with 
    heavy daily resources, “self-pace” learning program for which you disengage too 
    soon or long programs that lasts for hours and months, we only ask you for 20-25 
    minutes or less on a daily basis for 66 days. That’s it!
    </p>
    <p>
    Enjoy the program. Happy learning. And please do not hesitate to reach out if you 
    have any questions: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Enrique Rubio <br>
      Founder <br>
      Hacking HR <br>
    </p>
    `,
  },
  DAILY_RESOURCE: {
    subject: (cohort, resource) => `
    Today’s Resource is: "${resource.title}"
    `,
    body: (user, cohort, resource) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Today’s resource as part of the Cohort ${cohort.title} is: <br> <br>
      - ${resource.title} <br>
      - Type: ${resource.type} <br>
      - Link: ${resource.resourceLink} <br>
      - Estimated duration: ${resource.duration} minutes <br>
    </p>
    <p>
    Please remember to provide your reflection about this resource. The reflection 
    should address the question: “what did I learn from this resource and how can I 
    apply it in my day to day practice/work?”
    </p>
    <p>
    To enter your reflection, please go to the Hacking HR LAB, click on ProjectX -> My 
    Cohorts -> look for this cohort, and click on JOIN THE CONVERSATION on the 
    corresponding resource.
    </p>
    <p>
    Don’t forget that you will be removed from the program if you miss to provide your 
    response two times during a given week. This means that you must provide on at 
    least five resources during one week. If you fail this requirement you will be 
    removed from the program and will not have access anymore to the dashboard. We 
    assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
    Before then you should have completed five reflections or more to continue with the
    program the following week. The assessment of the completion of the weekly 
    requirement is an automated process and there is no way to include you again after
    you are removed from the cohort for missing two or more activities.
    </p>

    <p>
    Please note: whether you receive the daily email or not, the resource will be posted 
    in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
    somewhere in the strange world of the Internet. If that’s the case, please GO to the 
    Cohort dashboard and review the resource. You still have to complete the daily 
    activity, even if you don’t receive the daily resource email on a given day.
    </p>
    <p>
    Finally, if you have any trouble accessing the cohort on your mobile device, please 
    try from your computer.
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  KICK_OUT: {
    subject: (cohort) => `
    You have missed two mandatory activities ${cohort.title} - you can’t join this cohort 
    anymore
    `,
    body: (user, cohort) => `
    <p>
      Hi ${user.firstName}
    </p>
    <p>
    Unfortunately you have missed two mandatory activities this week. We understand 
    that life and work happen and perhaps other priorities came up and you had to 
    reallocate your time. It’s ok. 
    </p>
    <p>
    We hope you can join a future cohort on the same skill or any other similar skill. 
    </p>
    <p>
    You won’t be able to join this cohort’s dashboard anymore and you will not receive 
    any more information about it. 
    </p>
    <p>
      Thank you for your understanding. 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  WITHDRAW_PARTICIPATION: {
    subject: (cohort) =>
      `You have withdrawn from Hacking HR's ProjectX: ${cohort.title}`,
    body: (user) => `
    <p>
      Hi ${user.firstName}, <br>
    </p>
    <p>
      We are sorry to see you withdraw from the cohort. We hope everything is well! <br>
    </p>
    <p>
    Don't worry, though, if you can't join this time. We have many more cohorts and skills coming up! <br>
    </p>
    <p>
    Thank you so much! <br>
    </p>
    <p>
      Hacking HR Team
    </p>
    `,
  },
  SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS: {
    subject: (cohort, startDate) => `
      One Week to Kick-Off Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (user, cohort) => `
      <p>
        Hi ${user.firstName}, <br>
      </p>
      <p>
        We are only one week away from the kick-off of Hacking HR's ProjectX Cohort: ${cohort.title}<br>
      </p>
      <p>
        We are so excited that you are joining! <br>
      </p>
      <p>
        As you know, we created this tool with one idea in mind: to help you learn or improve your knowledge in ${cohort.title} through daily resources, personal reflections and assessment of your fellow cohort participants’ reflections! <br>
      </p>
      <p>
      This program is intense, but light touch: we will provide a daily resource that you 
      should be able to read, listen or watch in less than 20 minutes. Daily means daily: 
      66 consecutive days. 
      <br>
      </p>
      <p>
      Besides reading, listening or watching the daily resource, you will provide a 
      personal reflection about what you learned and how you plan to apply the lessons 
      learned.
      <br>
      </p>
      <p>
      This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, 
      you will receive a daily resource and you must provide a reflection about the 
      resource. The reflection should address the question: “what did I learn from this 
      resource and how can I apply it in my day to day practice/work?” 
      <br>
      </p>
      <p>
      Reading, listening or watching the resource and providing the reflection shouldn’t 
      take more than 20-25 minutes per day... Hey, “excellence is a habit”... and we aim 
      to make light-touch learning a habit with discipline and commitment. <br>
      </p>
      <p>
      As I mentioned before, the program relies on daily consistency and discipline. 
      Instead of bugging you with heavy daily resources, “self-pace” learning program for 
      which you disengage too soon or long programs that lasts for hours and months, we
      only ask you for 20-25 minutes or less on a daily basis for 66 days. That’s it!  <br>
      </p>
      <p>
      Don’t forget that you will be removed from the program if you miss to provide your 
      response two times during a given week. This means that you must provide on at 
      least five resources during one week. If you fail this requirement you will be 
      removed from the program and will not have access anymore to the dashboard. We 
      assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
      Before then you should have completed five reflections or more to continue with the
      program the following week. The assessment of the completion of the weekly 
      requirement is an automated process and there is no way to include you again after
      you are removed from the cohort for missing two or more activities.
      </p>

      <p>
      Please note: whether you receive the daily email or not, the resource will be posted 
      somewhere in the strange world of the Internet. If that’s the case, please GO to the 
      in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
      Cohort dashboard and review the resource. You still have to complete the daily 
      activity, even if you don’t receive the daily resource email on a given day.
      </p>

      <p>
      Finally, if you have any trouble accessing the cohort on your mobile device, please 
      try from your computer.
      </p>

      <p>
      Enjoy the program. Happy learning. And please do not hesitate to reach out if you 
      have any questions:  <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
      </p>
    
      <p>
        Thank you!
      </p>
      <p>Enrique Rubio</p>
      <p>Founder</p>
      <p>Hacking HR</p>
    `,
  },
  SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS: {
    subject: (cohort, startDate) => `
      This is it! We are kicking off tomorrow! Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (
      user,
      cohort,
      startDate,
      endDate,
      numOfParticipants,
      numOfCountries
    ) => `
      <p>
        Hi ${user.firstName}, <br>
      </p>
      <p>
        This is it, folks! We are kicking off Hacking HR's ProjectX Cohort: ${cohort.title} tomorrow, ${startDate} and will last for 66 consecutive days until ${endDate}.  <br>
      </p>
      <p>
        We wanted to send you a quick summary about what to expect during the program:<br>
      </p>
      <ul>
        <li>For 66 consecutive days you will receive a daily a daily resource that you should be able to read, listen or watch in less than 20 minutes. We will send it via email, every day at 3 a.m. Pacific Time (we are early birds here!). If you don’t receive it, all you have to do is go to the cohort’s dashboard: https://www.hackinghrlab.io/projectx/${cohort.id}/resources and the resource will show.</li>
        <li>After reading, listening or watching the resource, you will provide a personal reflection about what you learned and how you plan to apply the lessons learned.</li>
        <li>Also, daily, you will look at some of the reflections provided by other participants’ and provide your feedback to their reflections.</li>
        <li>In addition, you have access to the participants’ tab where you can see who is part of the cohorts and further connect with them.</li>
      
      </ul>
     
      <p>
      You already know this: ProjectX relies on daily consistency and discipline. Instead of 
      bugging you with heavy daily resources, “self-pace” learning program for which you
      disengage too soon or long programs that lasts for hours and months, we only ask 
      you for 20-25 minutes or less on a daily basis for 66 days. That’s it! <br>
      </p>
      <p>
      Don’t forget that you will be removed from the program if you miss to provide your 
      response two times during a given week. This means that you must provide on at 
      least five resources during one week. If you fail this requirement you will be 
      removed from the program and will not have access anymore to the dashboard. We 
      assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
      Before then you should have completed five reflections or more to continue with the
      program the following week. The assessment of the completion of the weekly 
      requirement is an automated process and there is no way to include you again after
      you are removed from the cohort for missing two or more activities.  <br>
      </p>
      <p>
      
      Please note: whether you receive the daily email or not, the resource will be posted 
      in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
      somewhere in the strange world of the Internet. If that’s the case, please GO to the 
      Cohort dashboard and review the resource. You still have to complete the daily 
      activity, even if you don’t receive the daily resource email on a given day.
      </p>
      <p>
        Last, but not least. This cohort is starting with ${numOfParticipants} participants and they come from ${numOfCountries} countries. So, happy learning and also happy networking! <br>
      </p>
      <p>
        Enjoy the program. And please do not hesitate to reach out if you have any questions: <br>
        <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a> <br>
      </p>
      <p>
        Thank you!
      </p>
      <p>
      Founder
      </p>
      <p>
      Hacking HR
      </p>
    `,
  },
  INVITATION_TO_JOIN: {
    subject: (hostUser, userInvited) =>
      `Hi ${userInvited.name}, ${hostUser.firstName} ${hostUser.lastName} is inviting you to join the Hacking HR 2022 Global Online Conference`,
    body: (hostUser, userInvited, link) => `
  <p>
  Hi ${userInvited.name}!<br>
  </p>
  <p>
  How are you?
  </p>
  <p>
  Hey, we wanted to let you know that ${hostUser.firstName} ${hostUser.lastName} would love for you to 
  join the Hacking HR 2022 Global Online Conference “HR Innovation and Future of 
  Work”.
  </p>
  <p>
  Join here: <a href="${link}">${link}</a><br>
  </p>
  <p>
  Hacking HR’s Global Online Conference is the most robust HR event in the world. 
  </p>
  <p>
  It includes more than 300 sessions with over 500 speakers from all over the world. 
  The event includes over 80 tracks with 3 panels each one, dozens of presentations 
  and roundtable conversations, and countless networking opportunities.
  </p>
  <p>
  The entire content of the conference during and post-event is FREE!
  </p>
  <p>
  And for our premium members in the Hacking HR LAB: in addition to all the content 
  of the conference, you can also earn HR certification credits (more than 500 credits 
  available for the event!).
  </p>
  <p>
  Join us! 
  </p>
  <p>   
    Hacking HR Team
  </p>
  `,
  },
  USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS: {
    subject: `User confirm accessibility requiriments`,
    body: (user) => `
  <p>
  ${user.firstName} ${user.lastName} <br>
  </p>
  <p>
  ${user.email}<br>
  </p>
  </p>
  <p>
    Hacking HR Team
  </p>
  `,
  },

  USER_BECOME_BUSINESS_PARTNER: {
    subject: `User want apply to the business partner community`,
    body: (user, link, applyState) => `
  <p>
   ${user.firstName} ${user.lastName} <br>
  </p>
  <p>
  <strong>Email:</strong> ${user.email}<br>
  </p>
  <p><strong>Company:</strong> ${user.company}</p>
  <p><strong>Company size:</strong> ${user.sizeOfOrganization}</p>
  <p></p>
  <p>
    <strong>Linkedin:</strong> ${user.personalLinks.linkedin}<br>
  </p>
  <h3>${applyState ? applyState : ""}</h3>
  </p>
  <div>
    Accept: <a href="${link}&accepted=true">${link}</a><br>
    Reject: <a href="${link}&accepted=false">${link}</a><br>
  </div>
  <p>
    Hacking HR Team
  </p>
  `,
  },

  USER_BECOME_SPEAKER_2023: {
    subject: `User want apply to the speakers2023 community`,
    body: (
      firstName,
      lastName,
      email,
      company,
      sizeOfOrganization,
      personalLinks,
      link
    ) => `
      <p>
      ${firstName} ${lastName} <br>
      </p>
      <p>
      <strong>Email:</strong> ${email}<br>
      </p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Company size:</strong> ${sizeOfOrganization}</p>
      <p></p>
      <p>
        <strong>Linkedin:</strong> ${personalLinks.contact}<br>
      </p>
      </p>
      <div>
        <a href="${link}&accepted=true">${"Accept"}</a><br>
        <a href="${link}&accepted=false">${"Reject"}</a><br>
      </div>
      <p>
        Hacking HR Team
      </p>
    `,
  },

  USER_ACCEPTED_SPEAKER: {
    subject: (firstName) =>
      `${firstName}: your application to join us as speaker at FORWARD2023 has been approved! Please select the panels you want to join. Thank you!`,
    body: (user) => `
      <p>
        Hi ${user.firstName},
      </p>
      <p>
        I am excited that you are joining us as a speaker at Hacking HR’s <b>FORWARD2023</b>! 
      </p>
      <p>
        We are planning an amazing conference experience and we are thrilled to have you with us. 
      </p>
      <p>
        This is what comes next: 
      </p>
      <p>
        <ol>
          <li>Please go to this link: https://www.hackinghrlab.io/speakers2023</li>
          <li>The panels are listed in that link. We may add more panels later on, but those are the ones we have for now. </li>
          <li>Please join one or up to two panels. Just click on “JOIN”. If you click on “More Information” you will be able to see the rest of the panelists for that panel. Each panel has up to five panelists and a moderator. You can join up to two panels. Please I kindly ask you to make sure you are selecting the panel you are interested to join. Withdrawing from a panel later creates a lot of problems!</li>
          <li>The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.</li>
        </ul>
      </p>
      <p>
        Please add your name to the panels no later than August 26th. We will close the system by then and you won’t be able to join anymore.
      </p>
      <p>
        Please do let me know if you have any questions. 
      </p>
      <p>
        Thank you so much for being part of this experience! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },

  USER_REJECT_SPEAKER: {
    subject: `You have been rejected for speakers 2023.`,
    body: (user) => `
      <p>
      Hi ${user.firstName} ${user.lastName} <br>
      </p>
      <p>Thank you for apply to speakers 2023, unfortunately, your permissions have been rejected</p>
      <p>
        Hacking HR Team
      </p>
    `,
  },

  REJECT_USER_APPLY_PARTNER_BUSSINESS: {
    subject:
      "Your Application for Hacking HR’s HR Business Partners Community was not approved",
    body: (user) => `
  <p>
  </p>
  <p>
  Hi ${user.firstName}
  </p>
  <p>
  Thank you for sending your application to be part of the HR Business Partners 
  Community. 
  </p>
  <p>
  We built this community specifically for HR professionals who currently are HR Business Partners or, even if they don’t have the “official” HR Business Partner title, are performing HR Business Partnering functions.
  </p>
  <p>
  In reviewing your Hacking HR LAB profile we don’t see that you are either an HR Business Partner or performing those functions. We may be missing something. That happens. In that case, please let us know if we made a mistake so that we can reconsider your application. To do this, please send the application again and make sure to add any new information in the comment box provided in the application.
  </p>
  <p>
  There are still many tools for you to enjoy in the Hacking HR LAB and we hope you 
  do! 
  </p>
  <p>Thank you so much.</p>
  <p>
  The Hacking HR Team
  </p> 
    `,
  },
  ACCEPT_USER_APPLY_PARTNER_BUSSINESS: {
    subject: "Welcome to the HR Business Partners Community by Hacking HR",
    body: (user, link) => `
    Hi ${user.firstName}
  </p>
  <p>
  We are excited to welcome you to the HR Business Partners Community in the 
  Hacking HR LAB. 
  </p>
  <p>
  This space is dedicated to the community of HR Business Partners and our hope is 
  for it to become a place for learning, collaboration, community, support and much 
  more!
  </p>
  <p>
  In the HR Business Partners community you will be able to share resources, join 
  conversations, upload and download valuable documents created by the 
  community, join project conversations, connect with other HR Business Partners, 
  help each other and a lot more.
  </p>
  <p>
  We will be including more tools for collaboration, community and learning in the 
  Community of HR Business Partners. This is just the beginning! 
  </p>
  <p>
  To access the HR Business Partners Community dashboard, please click on your 
  profile (top right) and there will be a button: “HR Business Partners Community”. If 
  you are a PREMIUM member of the Hacking HR LAB, you can access right away. If 
  not, you have to UPGRADE your account first to have access to the dashboard.
  </p> 
  <p>
  If there is anything that you believe can be of value to you and the community... 
  well... don’t hesitate to let me know!
  </p>
  <p>
  Thank you so much! And please remember to be an active member of the 
  community. 
  </p>
  <p>Enrique Rubio</p>
  <p>Founder</p>
  <p>Hacking HR</p>`,
  },
  USER_AFTER_APPLY_BUSINESS_PARTNER: {
    subject: `Your Application for the Hacking HR’s HR Business Partners Community has been received`,
    body: (user) =>
      `<p>Hi ${user.firstName},</p>
      <p>Thank you for sending your application to be part of the HR Business Partners 
      Community.</p>
      <p>We will review your application and you should receive a response within the next 
      48 hours.</p> 
      <p>Thank you so much.</p> 
      <p>The Hacking HR Team</p>`,
  },
  USER_AFTER_APPLY_SPEAKER_2023: {
    subject: (firstName) =>
      `${firstName} your application to join us as speaker at FORWARD2023 has been received`,
    body: (firstName) =>
      `<p>Hi ${firstName},</p>

      <p>I have received your application to join us as a speaker at the Hacking HR 2023 Global Conference, now called: <b>FORWARD 2023</b>.</p>

      <p>I review all the applications to make sure we are only including approved speakers. </p>

      <p>You will receive an email shortly with your approval. As soon as your access to the speakers’ dashboard is approved you will be able to see all the sessions (panels) and select one or two that you want to join. </p>

      <p>Thank you!</p>

      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  JOB_POST_INVITATION_TO_APPLY: {
    subject: (jobPost) =>
      `You have been invited to apply to ${jobPost.jobTitle}`,
    body: (user, recruiter, jobPost) => `
      <p>
        Hi ${user.firstName}<br>
      </p>
      <p>
        Thank you for being part of the Hacking HR’s Talent Marketplace! <br>
      </p>
      <p>
        <a href="${recruiter.personalLinks.linkedin}" target="_blank">${recruiter.firstName} ${recruiter.lastName}</a>
        is inviting you to apply for this job: <a href="${jobPost.linkToApply}" target="_blank">${jobPost.jobTitle}</a> <br>
      </p>
      <p>
        We hope this is a good match for you and we wish you not just good luck… but the BEST luck in process! <br>
      </p>
      <p>
        Please do not hesitate to let us know if there is anything we can do to help you. We are here for you! <br>
      </p>
      <p>
        Thank you! <br>
      </p>
      <p>Hacking HR Team</p>
    `,
  },
  NOTIFY_QUALIFIED_USERS_OF_A_JOB_POST: {
    subject: (jobTitle) => `Maybe this job is of your interest: ${jobTitle}`,
    body: (user, link) => `
    <p>
      Hi ${user.firstName}<br>
    </p>
    <p>
      Thank you for being part of the Hacking HR’s Talent Marketplace! <br>
    </p>
    <p>
      Based on the criteria and skills you selected in Hacking HR’s Talent Marketplace, we think this job may be of your interest: 
      <a href="${link}" target="_blank">${link}</a>
    </p>
    <p>
      We hope this is a good match for you and we wish you not just good luck… but the BEST luck in process! <br>
    </p>
    <p>
      Please do not hesitate to let us know if there is anything we can do to help you. We are here for you! <br>
    </p>
    <p>
      Thank you! <br>
    </p>
    <p>Hacking HR Team</p>
  `,
  },
  USER_BECOME_CREATOR: {
    subject: () => `Thank you for becoming a CREATOR in the Hacking HR LAB!`,
    body: (user) => `
      <p>
        Hi ${user.firstName},
      </p>
      <p>
        We are excited to welcome you as a CREATOR in the Hacking HR LAB. 
        CHANNELS functionality was built for CREATORS like you. And this is just the beginning.
      </p>
      <p>
        We are firm believers in the unlimited opportunities of the creators' economy and we are planning to deliver a lot of resources for CREATORS like you.
      </p>
      <p>
        In particularly, our aim is to create the technology to create, share and monetize content designed for HR professionals by our community of CREATORS!
      </p>
      <p>
        For now, <a href="https://www.youtube.com/watch?app=desktop&v=DpCqM42fWRE" target="_blank" >please check out this video to learn how to use the existing CREATORS platform</a>. 
      <p>
      <p>
        Please do not hesitate to let us know if you have any questions.
      </p>
      <p>
        We are here to help you and we hope that this tool (what already exists and what will exist soon!).
      </p>
      <p>
        Thank you so much!
      </p>
      <br />
      The Hacking HR Team
    `,
  },
  USER_BECOME_RECRUITER: {
    subject: () => `Thank you for becoming a RECRUITER in the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi ${user.firstName},
      </p>
      <p>
        We are excited to welcome you as a recruiter in the Hacking HR LAB.
      </p>
      <p>
        The Talent Marketplace functionality was built for recruiters like you to take full advantage of the Talent Marketplace we are building inside the LAB.
      </p>
      <p>
        You can post your jobs by click on Talent Marketplace (left menu) and then going to the “My Job Postings” tab.
      </p>
      <p>
        This is what we are building now and it's coming up in a few days:
      </p>
      <p>
        <ul>
          <li>Members in the LAB who match your job criteria will be notified</li>
          <li>You will be able to access a list of recommended candidates for your job instead of looking through the entire Talent Marketplace</li>
          <li>Your job will be posted across our social media channels (this one is coming in a few weeks)</li>
          <li>We will find matching candidates in our social media channels and invite them to apply (this one is also coming in a few weeks)</li>
        </ul>
      </p>
      <p>
        For now, please do not hesitate to let us know if you have any questions. We are here to help you and we hope that you can find amazing talent in the Hacking HR's Talent Marketplace!
      </p>
      <p>
        Thank you so much!
      </p>
      <br />
      The Hacking HR Team
    `,
  },
  USER_CONFIRM_LIVE_ASSISTENCE: {
    subject: (event) =>
      `Thank you for confirming your participation to Day ${event.firstDay} of ${event.allDays} at Hacking HR’s ${event.name}`,
    body: (user, event) => `
    <p>
    Hi ${user.firstName},
    </p>
    <p>
    Thank you for confirming your participation today.
    </p>
    <p>
    Please keep in mind that this event lasts ${event.allDays} days and you must attend to all the 
    sessions and days during the event to claim a Digital Certificate of Participation. 
    Watching the recorded videos after the event is not conducive to a Digital 
    Certificate of Participation.
    </p>
    <p>
    Today is Day  ${event.firstDay} of ${event.allDays} days of the event!.
    </p>
    <p>
    Your Digital Certificate of Participation will be available at the end of the event 
    (after the last session!) if you CONFIRM your participation in all days of this event.
    </p>
    <p>
    Thank you!
    </p>
    <p>
    Hacking HR Team
    </p>
  `,
  },
  USER_RENEW_PREMIUM: {
    subject: () =>
      `Thank you for renewing your annual subscription to the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
        Thank you so much for renewing your annual subscription to the Hacking HR LAB. 
      </p>
      <p>
        You can find your invoice by logging in the Hacking HR LAB and clicking Billing Information under your profile.
      </p>
      <p>
        We have added several exciting features over the past few months and many more tools are in the making. 
      </p>
      <p>
        Please make sure you take full advantage of our learning tools, our events and all the learning content that we have put together for you. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      The Hacking HR Team
      <br />
    `,
  },
  USER_ACCEPT_TERMS_CONDITIONS_GCONFERENCE: {
    subject: `Thank you for acknowledging and accepting the rules of engagement as part of the Hacking HR 2022 Global Online Conference`,
    body: () => `
    We appreciate you taking the time to carefully read, acknowledge and accept the 
    rules of engagement as part of the learning experience at the Hacking HR 2022 
    Global Online Conference. 
    </p>
    <p>
    We do this to make sure you know from the beginning what to expect from our 
    global online conference.
    </p>
    <p>
    The rules of engagement include:
    </p>
    <p>
    <strong>1. Content:</strong>The content of this conference during and post-event is completely FREE for the members of the 
    Hacking HR LAB. You can get access to the content at any time. However, you 
    must not reproduce totally or partially any part of this content outside of the 
    Hacking HR LAB without our explicit approval.
    </p>

    <p>
    <strong>2. Networking tools:</strong> there are several networking tools in the conference 
    application. Two in particular are very useful: Bonfires and Chat. Bonfires allow 
    you to create conversations with participants of the conference, and with the 
    chat you can connect individually with other participants. The networking tools 
    are for real networking conversations. If you use any of the tools for pitching, 
    marketing or selling any product or service, your account will be banned from 
    using the tools again for the duration of the conference.
    </p>

    <p>
    <strong>3. Conference sessions:</strong> you can’t join more than one session simultaneously 
    with other sessions. As soon as you click on JOIN a session, the option to join any
    other session at the same time and same date will be deactivated. You can join 
    more sessions at other times/dates.
    </p>

    <p>
    <strong>4. HR Credits:</strong> The conference offers more than 500 SHRM+HRCI credits. 
    The credits ARE NOT FREE and NOT transferable or shareable. 
    You MUST UPGRADE your account and become a PREMIUM member to get access to the credits. 
    Please do not email us asking for credit codes if you are not a PREMIUM user. 
    If you are a PREMIUM user, this is how it’ll work: two weeks after the conference 
    you will receive an email to download your personalized conference participation report. 
    This report will include the sessions you joined and ONLY the corresponding HRCI/SHRM codes to those sessions. 
    There is no need to email us asking for the codes. Also, please note that you SHOULD NOT share the codes with anyone. 
    Please wait until the report is ready no later than March 28th.
    </p>

    <p>
    <strong>5. Certificate of participation:</strong> a personalized certificate of participation will be 
    available to all members of the Hacking HR LAB. You can download it and also 
    share it in your social media. This certificate of participation will include all the 
    sessions you joined and the amount of hours you invested in your learning. The 
    certificate of participation will be available at the same time as your conference 
    participation report no later than March 28th.
    </p>

    <p>
    Thank you so much and enjoy the conference! We would love to hear your feedback
    afterward!
    </p>

    <p>
    THANK YOU!
    </p>
    <p>
    <br />
    Enrique Rubio
    <br />
    Founder
    <br />
    Hacking HR
    <br />
    `,
  },
  EVENT_JUST_END: {
    subject: (event) =>
      `Your Digital Certificate of Participation for joining Hacking HR’s ${event.title} is available for download`,
    body: (user, event, link) => `
    <p>
    Hi ${user.firstName},
    </p>
    <p>
    Thank you for joining us during all the sessions at Hacking HR’s ${event.title}.
    </p>
    <p>
      We hope that it was an exciting learning experience for you and that you took away 
      great and actionable insights to put into practice in your role.
    </p>
    <p>
      You can now download your Digital Certificate of Participation. Go to the 
      <a href="${link}" target="_blank">Hacking HR LAB</a>, click on your profile and then on My Learning. Then go to the tab “Digital 
      Certificates” to download.
    </p>
    <p>
      Thank you! We hope to see you in future events!
    </p>
    <p>
      Hacking HR Team
    </p>
  `,
  },
  MATCHMAKE_USERS: {
    subject: () => `Match user`,
    body: (matchedUser, advertiser, message) => `
      <p>
        Advertiser: ${advertiser.firstName} ${advertiser.lastName} <br/>
        Advertiser Email: ${advertiser.email} <br />
        Advertiser Message: ${message} <br />
      </p>

      <p>
        Matched User: ${matchedUser.firstName} ${matchedUser.lastName} <br/>
        Matched User Title: ${matchedUser.titleProfessions} <br/>
        Matched User Company: ${matchedUser.company} <br/>
        Matched User LinkedIn: ${matchedUser.personalLinks.linkedin} <br/>
      </p>
    `,
  },
  USER_BECOME_ADVERTISER: {
    subject: () =>
      `Thank you for purchasing your ADVERTISER add-on in the Hacking HR LAB!`,
    body: (firstName) => `
      <p>
        Hi ${firstName},
      </p>

      <p>We are excited to welcome you as “ADVERTISER” in the Hacking HR LAB (yes, we need to come up with a better name for this role!). </p>

      <p>This functionality was built to let people like you run marketing campaigns in the Hacking HR LAB.</p>

      <p>The most effective marketing campaigns are those with a compelling story and a strong call to action behind it. For example, links to great content or events. </p>

      <p>This is how you can start creating your marketing campaigns: </p>
      <ol type="1">
        <li>Click on “Partners Dashboard” under your profile</li>
        <li>In the first tab you can create a new campaign and see the dashboard with your created campaigns</li>
      </ol>

      <p>Each campaign requires that you enter the start and end date, an image at 1:1 resolution, a link and the page in which the campaign will be posted. We calculate the number of credits you need depending on the number of days and the page to post the campaign. </p>

      <p>We recommend that you run your campaign for no less than ten days. </p>

      <p>You will receive an email when you create and active your campaign, when your campaign starts and ends. We will send you an email when your campaign has ended which will include the number of impressions and clicks the campaign generated. </p>

      <p>For now, please do not hesitate to let us know if you have any questions. We are here to help you and we hope that you can generate great traction to your call to action.</p>

      <p>Thank you so much! </p>

      <p>The Hacking HR Team</p>
    `,
  },
  NEW_LIBRARY_CONTENT_FOR_APPROVAL: {
    subject: () => `New Library Content for Approval`,
    body: (title, user) => `
      <p>
        Title: ${title}
      </p>

      <p>
        User: ${user.firstName} ${user.lastName}
      </p>
    `,
  },
  THANK_YOU_PARTICIPATION_PROJECT_X: {
    subject: (cohort, date) =>
      `Thank you for joining Hacking HR’s ProjectX: ${cohort.title}. Your Digital Certificate of Completion will be available on ${date}`,
    body: (cohort, user, date) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      Thank you for joining Hacking HR’s ProjectX ${cohort.title}.  
      </p>
      <p>
      You are almost there! Please remember to complete this week’s required activities!  
      </p>
      <p>
      Upon completion of the last activities of the program, your Digital Certificate of Completion will be available on ${date}
      </p>
      <p>
        We have many more cohorts focused on other skills that are open now or will open soon! Please join us and continue your learning journey with Hacking HR!.
      </p>
      <p>
      Also, we would love to hear your feedback. Please let us know how we can make this program better for you and the rest of the participants. Just respond to this email letting us know your suggestions! 
      </p>
      <p>
      By next Monday ${date} you will have access to a Digital Certificate of Completion if you complete the rest of this week’s activities. Just go back to the Hacking HR LAB ProjectX’s module, and in the dashboard click on Digital Certificate in the completed cohort. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Hacking HR LAB
      <br />
      `,
  },
  NOTICE_NEW_MESSAGE_MODERATOR: {
    subject: (firstName, panelName) =>
      `Hi ${firstName}, in the event: ${panelName}`,
    message: (name, lastName) =>
      `<p>There is a new message from: ${name} ${lastName}</p>`,
  },
  COUNCIL_EVENT_JOIN: {
    subject: (firstName, panelName, eventName) =>
      `${firstName}, thank you for joining the panel: ${panelName} as part of the event ${eventName}`,
    body: (firstName, event, panel, abbr) => `
    <p>
      Hi ${firstName},
      </p>
      <p>
      Thank you for joining as a panelist in the panel: ${panel.panelName} which starts on ${panel.startDate} at ${panel.startTime} ${abbr} and ends on ${panel.endDate} at ${panel.endTime} ${abbr}.  
      </p>
      <p>
      This panel is part of the event ${event.eventName} (starting on ${event.startDate} and ending on ${event.endDate}). 
      </p>
      <p>
      The link to connect to this panel is: ${panel.linkToJoin}
      </p>
      <p>
      Please make sure you add the calendar invite attached to this email in your calendar. We will not send another calendar invite.
      </p>
      <p>
      Thank you so much and please stay tuned for more information coming in soon to prepare for the panel. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
    addedByAdminBody: (firstName, event, panel, abbr) => `
    <p>
      Hi ${firstName},
      </p>
      <p>
      Thank you for joining as a panelist in the panel: ${panel.panelName} which starts on ${panel.startDate} at ${panel.startTime} ${abbr} and ends on ${panel.endDate} at ${panel.endTime} ${abbr}.  
      </p>
      <p>
      This panel is part of the event ${event.eventName} (starting on ${event.startDate} and ending on ${event.endDate}). 
      </p>
      <p>
      The link to connect to this panel is: ${panel.linkToJoin}
      </p>
      <p>
      Thank you so much and please stay tuned for more information coming in soon to prepare for the panel. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  SPEAKERS_PANEL_JOIN: {
    subject: (firstName, panelName) =>
      `${firstName}: thank you for joining the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have joined the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> agenda.   
      </p>
      <p>
      <p>
        Thank you so much! 
      </p>
      <p>
        The panel moderator will be in touch with you and your fellow panelists starting at the end of August to coordinate the panel logistics and schedule the recording. 
      </p>
      <p>
        Please do let me know if you have any questions. 
      </p>
      <p>Thank you so much for being part of this experience!</p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  SPEAKERS_PANEL_JOIN_FOR_ADMIN: {
    subject: (firstName, panelName) =>
      `${firstName}: you have been added as a speaker in the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have been added as a speaker in the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> conference. 
      </p>
      <p>
      <p>
        We are planning an amazing conference experience and we are thrilled to have you with us. 
      </p>
      <p>
        The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.  
      </p>
      <p>
        Please do let me know if you have any questions. Thank you so much for being part of this experience! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR: {
    subject: (firstName, panelName) =>
      `${firstName}: you have been added as moderator in the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have been added as moderator in the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> conference.  
      </p>
      <p>
      <p>
        I will be in touch with more details soon! 
      </p>
      <p>
        Please do let me know if you have any questions. Thank you so much for being part of this experience!   
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  REGISTER_CONFERENCE_2023: {
    subject: () => `Thanks for register in speaker2023`,
    body: (firstName) => `
      <p>Hi ${firstName}, you just logged in to coference 202</p>
      `,
  },
  USER_PURCHASE_ADVERTISEMENT_CREDITS: {
    subject: (numOfCredits) =>
      `(Hacking HR LAB) Thank you for purchasing ${numOfCredits} credits!`,
    body: (firstName, numOfCredits) => `
      <p>Hi ${firstName},</p>

      <p>We just wanted to send you a quick note to confirm your purchase of ${numOfCredits} to use to create your marketing campaigns in the Hacking HR LAB.</p>

      <p>Do not hesitate to let us know if you have any question.</p>

      <p>Thank you!</p>

      <p>Hacking HR Team</p>
    `,
  },
  USER_PURCHARSE_SIMULATIONS_SPRINTS: {
    subject: (firstName, numOfSimulations) =>
      `${firstName} Thank you for purchasing a package of ${numOfSimulations} Hacking HR’s Simulation Sprints!`,
    body: (firstName, numOfSimulations) => `
    <p>Hi ${firstName},</p>

    <p>Thank you so much for joining our flagship learning program: Simulation 
    Sprints, and purchasing ${numOfSimulations} sprints.</p>

    <p>We hope that you find this learning approach to be useful and valuable. So, 
    this is what’s next:</p>

    <ol>
    <li>Your available Simulation Sprints credits don’t have an expiration date.
    In the menu bar in Simulation Sprints in the <a href="${process.env.DOMAIN_URL}">Hacking HR LAB</a> you will be
    able to see how many you have available.
    </li>

    <li>
    You can sign up for any of the open Simulation Sprints. If you don’t see
    anything of your interest, please wait for the new ones to be posted. 
    We are planning to open one or two Simulation Sprints per month. 
    Please note that you can only withdraw from a Simulation Sprint up to 
    the day before it starts for it not to count toward your available credits.
    You will still be using one available credit if you don’t withdraw on time
    or don’t complete the program requirements.
    </li>
    </ol>

    <p>
    We are excited to have you joining us in this program. Please do let us know 
    any feedback you have! You can find me here: <a href="mailto:webmaster@example.com">enrique@hackinghr.io</a>
    </p>

    <p>Thank you!</p>

    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hackig Hr</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_START: {
    subject: () => `(Hacking HR LAB) Your campaign is now LIVE!`,
    body: (user) => `
    <p>Hi ${user.firstName},</p>

    <p>We just wanted to send you a quick note to let you know that your campaign is now LIVE! </p>

    <p>Starting now until the end of your campaign on ${user.endDate} you can only edit the link and image of the campaign. You can’t edit dates or the page you originally selected it to be published. </p>

    <p>We will provide impressions and clicks data at the end of your campaign. </p>

    <p>Do not hesitate to let us know if you have any question. </p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_END: {
    subject: () => `(Hacking HR LAB) Your campaign has now ended.`,
    body: (firstName, numOfImpressions, numOfClicks) => `
    <p>Hi ${firstName},</p>

    <p>We just wanted to send you a quick note to let you know that your campaign has already ended.  </p>

    <p>Your campaign generated ${numOfImpressions} impressions and ${numOfClicks} clicks. </p>

    <p>We hope you continue creating more marketing campaigns in the Hacking HR LAB!</p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_ACTIVE: {
    subject: () =>
      `(Hacking HR LAB) Your campaign has been successfully activated`,
    body: ({
      user,
      startDate,
      startTime,
      endDate,
      endTime,
      days,
      creditsUsed,
      creditsLeft,
      page,
      link,
    }) => `
    <p>Hi ${user.firstName},</p>

    <p>Thank you for creating your marketing campaign in the Hacking HR LAB!</p>

    <p>Your campaign will start on ${startDate} at ${startTime} and end on ${endDate} at ${endTime}, for a total duration of ${days} day/s. For this campaign you are using ${creditsUsed} credits and you have ${creditsLeft} credits left. </p>

    <p>Your campaign will be posted in the ${page} page in the Hacking HR LAB. </p>

    <p>The link of your campaign is: ${link}. </p>

    <p>Now that your campaign is active, you can do the following in the Partners Dashboard</p>
    <ol>
      <li>Edit the link and image of the campaign by clicking the EDIT icon on the right side of your campaign</li>
      <li>See the number of impressions</li>
      <li>See the number of clicks</li>
    </ol>

    <p>Do not hesitate to let us know if you have any question. </p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT: {
    subject: (eventName) => `REMINDER! In one week: ${eventName}`,
    body: (firstName, event, panels) => `
      <p>Hi ${firstName},</p>

      <p>This is a reminder that ${event.eventName} is coming up in one week. </p>

      <p>This event is on: ${event.startDate} until ${event.endDate}. </p>

      <p>You are signed up as a panelist in the panel/s:</p>

      <p>${panels}</p>

      <p>Please make sure you have the calendar invite in your calendar with the corresponding link. </p>

      <p>Also, please add the questions/topics you want the panel to cover. You have until one day before the event to do this. This is how: </p>

      <ol>
        <li>Log in the Hacking HR LAB: https://www.hackinghrlab.io/</li>
        <li>Click on Experts Council under your profile, then click on EVENTS</li>
        <li>Click on ${event.eventName}</li>
        <li>Click on the panels you joined and add your questions/comments in the corresponding section. </li>
      </ol>

      <p>Thank you!</p>

      <p>Enrique</p>
    `,
  },
  REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT: {
    subject: (eventName) => `STARTING TOMORROW: ${eventName}! `,
    body: (firstName, panels, eventName) => `
      <p>Hello ${firstName},</p>

      <p>We are kicking this off tomorrow! </p>
      <p>You are signed up as a panelist in the panel/s:</p>
      ${panels}

      <p>Please make sure you have the calendar invite in your calendar with the corresponding link. </p>

      <p>Also, please add the questions/topics you want the panel to cover. You have until one day before the event to do this. This is how: </p>
      <ol>
        <li>Log in the Hacking HR LAB: https://www.hackinghrlab.io/</li>
        <li>Click on Experts Council under your profile, then click on EVENTS</li>
        <li>Click on ${eventName}</li>
        <li>Click on the panels you joined and add your questions/comments in the corresponding section. </li>
      </ol>

      <p>Thank you!</p>

      <p>Enrique</p>
    `,
  },
  REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS: {
    subject: (panelName) =>
      `Your panel ${panelName} is kicking off in one hour! (link and questions/topics included in this email)`,
    body: (firstName, panel, comments, moderatorName) => `
      <p>Hello ${firstName},</p>

      <p>Your panel: ${panel.panelName} is kicking off in one hour, at ${panel.startTime}. Please connect five minutes before the kick off time. </p>

      <p>This is the link to connect: ${panel.linkToJoin}. </p>
      <p>These are the questions/topics entered by the panelists, which will be the core of the conversation: </p>

      <ul>
        ${comments}
      </ul>

      <p>${moderatorName}</p>

      <p>Thank you and see you shortly!</p>

      <p>Enrique</p>
    `,
  },
  SEND_DAILY_COMMENTS_TO_MODERATOR: {
    subject: (panelName) =>
      `Here are yesterday's comments on panel ${panelName}`,
    body: (comment) => `
    <p>Hi</p>

    ${comment}
    `,
  },
  EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED: {
    subject: (eventName) =>
      `(For Hacking HR’s Experts Council Founding Members) CALL FOR SPEAKERS! NEW EVENT: ${eventName}`,
    body: (firstName, event, panels) => `
      <p>Hi ${firstName},</p>

      <p>I am excited to share with you that we are planning a new event: ${event.eventName}</p>

      <p>This event is on: ${event.startDate} until ${event.endDate}. </p>
      <p>Check out the ${event.numberOfPanels} panels we will have at the event: </p>

      <p>${panels}</p>

      <p>Do you want to join us? </p>

      <p>This is how: </p>

      <ol>
        <li>Log in the Hacking HR LAB: https://www.hackinghrlab.io/</li>
        <li>Click on Experts Council under your profile, then click on EVENTS</li>
        <li>Click on ${event.eventName}</li>
        <li>Click on JOIN to confirm your participation in the panel of your interest. Please note that you can only join up to ${event.maxNumberOfPanelsUsersCanJoin} panels. </li>
      </ol>

      <p>You will receive an email for each of the panels you join. Just make sure that after clicking on JOIN you download the calendar invite and add it in your calendars. We will not send a separate calendar invite.</p>

      <p>THANK YOU and stay tuned for more information! </p>

      <p>Thank you!</p>

      <p>Enrique</p>
    `,
  },
  JOIN_SIMULATION_SPRINT: {
    subject: (
      firstName,
      simulationSprint
    ) => `${firstName} Thank you for registering for Hacking HR’s 
    Simulation Sprint: ${simulationSprint.title}`,
    body: (firstName, simulationSprint) => `
    <p>Hi ${firstName}</p>

    <p>Thank you so much for registering for Hacking HR’s Simulation Sprint: ${simulationSprint.title}.</p>

    <p>This Simulation Sprint starts on ${simulationSprint.startDate} and ends on ${simulationSprint.endDate}. </p>

    <p>
    We are very excited to have you with us in this unique learning program. 
    This is what comes next:
    </p>

    <ol>
    <li>
    The first day of the Simulation Sprint (${simulationSprint.startDate}) you will receive a 
    package that includes: names and contact information of your 
    teammates in your small working team, the business case you and 
    your team will be working on for the next four weeks and the 
    deliverables that you and your team (together) will be submitting each 
    week as required by the program. Also, on day 1 of the Simulation 
    Sprint you will receive the full calendar of the Sprint which includes 
    attached calendar reminders (so that you don’t forget to submit your 
    requirements! This is a no-excuse-learning-program!).
    </li>

    <li>
    Every week you will receive a package of resources in the form of links 
    to available and free resources that we selected and curated for you. 
    The resources in each weekly package were curated to help you 
    navigate the complexity of the business case and, more specifically, 
    help you craft the content of each weekly submission. 
    </li>

    <li>
    Finally, you can go back to the Simulation Sprint’s Dashboard (go to 
      the <a href="${process.env.DOMAIN_URL}">Hacking HR LAB</a>, click on Simulations on the left side menu, then 
      click on My Sprints and Enter Dashboard on the corresponding 
      Simulation Sprint). The dashboard will include a list of the weekly 
      resources, the calendar, your team members and their contact 
      information as well.
    </li>
    </ol>

    <p>
    ${firstName}: I am thrilled you decided to be part of this learning program. 
    We hope it is valuable and, more importantly, that as you go through the 
    program you can also reflect and find ways to apply what you are learning in 
    your own HR practice/job.
    </p>

    <p>
    Do not hesitate to let me know if you have any questions! Reach out to me 
    at any time, for anything you need! I am here: <a href="mailto:webmaster@example.com">enrique@hackinghr.io</a>
    </p>

    <p>Thank you!</p>

    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hackig Hr</p>
    `,
  },
  SIMULATION_SPRINT_REMINDER_24_HOURS: {
    subject: (simulationSprint) =>
      `${simulationSprint.title} is coming up in one day!`,
    body: (user, simulationSprint) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      We are so excited you are joining us at ${simulationSprint.title}.
      </p>
      <p>
      remember that tomorrow the simulation starts so don't miss it!
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  SIMULATION_SPRINT_REMINDER_SAME_DAY: {
    subject: (simulationSprint) => `${simulationSprint.title} starts today!`,
    body: (user, simulationSprint) => `
    <p>
    Hi, ${user.firstName}
    </p>
    <p>
    today we start the simulation ${simulationSprint.title}.
    </p>
    <p>
    Remember to fulfill each of your assignments
    </p>
    <br />
    Thank you!
    <br />
    Hacking HR Team
    <br/>
  `,
  },
};
