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
      We are so excited to have you join the cohort ${cohort.title} starting on ${startDate}!
    </p>
    <p>
      We created this tool with one idea in mind: to help you learn or improve your knowledge in ${cohort.title} through daily resources, personal reflections and assessment of your fellow cohort participants’ reflections! 
    </p>
    <p>
    This program is intense, but light touch: we will provide a daily resource that you should be able to read, listen or watch in less than 20 minutes. After reading, listening or watching the resource, you will provide a personal reflection about what you learned and how you plan to apply the lessons learned. Finally, you will look at some of the reflections provided by other participants’ and provide your feedback. 
    </p>
    <p>
    This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, you will receive a daily resource, provide the reflection and assess your fellow cohort members’ reflections. This won’t take more than 20-25 minutes per day… Hey, “excellence is a habit”… and we aim to make light-touch learning a habit with discipline and commitment. 
    </p>
    <p>
    There will be a few meetings with a small and selected group of cohort participants. In addition, mid-way into the program and at the end of the program you will have to provide a resolution to a business case we will be posting. 
    </p>
    <p>
    As I mentioned before, the program relies on daily consistency and discipline. Instead of bugging you with heavy daily resources, “self-pace” learning program for which you disengage too soon or long programs that lasts for hours and months, we only ask you for 20-25 minutes or less on a daily basis for 66 days. That’s it! 
    </p>
    <p>
      Enjoy the program. Happy learning. And please do not hesitate to reach out if you have any questions: enrique@hackinghr.io
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
      Please remember to: <br> <br>
      -	Provide your response to today’s question about this resource in the cohort dashboard. <br>
      -	Assess the responses provided by other cohort participants
    </p>
    <p>
      Don’t forget that you will be removed from the program if you miss to provide your response two times during a given week or if you miss to assess other participants’ responses two times during a given week. 
    </p>
    <p>
      Please note: whether you receive the daily email or not, the resource will be posted in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck somewhere in the strange world of the Internet. If that’s the case, please GO to the Cohort dashboard and review the resource. You still have to complete the daily activity, even if you don’t receive the daily resource email on a given day.  
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
    You have missed two mandatory activities for Hacking HR’s ProjectX ${cohort.title} (you can’t join this cohort anymore)
    `,
    body: (user, cohort) => `
    <p>
      Hi ${user.firstName}
    </p>
    <p>
      Unfortunately you have missed two mandatory activities this week corresponding to Hacking HR’s ProjectX ${cohort.title}. 
    </p>
    <p>
      We understand that life and work happen and perhaps other priorities came up and you had to reallocate your time. It’s ok.  
    </p>
    <p>
      We hope you can join a future cohort on the same skill or any other similar skill. We will be opening similar cohorts (if not the same!) several times during the year. 
    </p>
    <p>
      You won’t be able to join this cohort’s dashboard anymore and you will not receive any more information about it. 
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
        This program is intense, but light touch: we will provide a daily resource that you should be able to read, listen or watch in less than 20 minutes. After reading, listening or watching the resource, you will provide a personal reflection about what you learned and how you plan to apply the lessons learned. Finally, you will look at some of the reflections provided by other participants’ and provide your feedback. <br>
      </p>
      <p>
        This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, you will receive a daily resource, provide the reflection and assess your fellow cohort members’ reflections. This won’t take more than 20-25 minutes per day.<br>
      </p>
      <p>
        There will be a few meetings with a small and selected group of cohort participants. In addition, mid-way into the program and at the end of the program you will have to provide a resolution to a business case we will be posting. <br>
      </p>
      <p>
        As I mentioned before, the program relies on daily consistency and discipline. Instead of bugging you with heavy daily resources, “self-pace” learning program for which you disengage too soon or long programs that lasts for hours and months, we only ask you for 20-25 minutes or less on a daily basis for 66 days. That’s it! <br>
      </p>
      <p>
        Please note: you won’t be able to continue enrolled in the program if you miss two activities (reflections or comments on other participants’ reflections) in a given week. This is automated and there is no way to include you again after you are removed from the cohort for missing two activities. <br>
      </p>
      <p>
        Enjoy the program. Happy learning. And please do not hesitate to reach out if you have any questions:
      </p>
      <p>
        enrique@hackinghr.io <br>
      </p>
      <p>
        Thank you!
      </p>
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
        <li>Finally, there will be a “playground” to start experimenting and creating ideas together and you can get involved in this playground as much as you want.</li>
      </ul>
      <p>
        Please note: you won’t be able to continue enrolled in the program if you miss two activities (reflections or comments on other participants’ reflections) in a given week. This is automated and there is no way to include you again after you are removed from the cohort for missing two activities. <br>
      </p>
      <p>
        You already know this: ProjectX relies on daily consistency and discipline. Instead of bugging you with heavy daily resources, “self-pace” learning program for which you disengage too soon or long programs that lasts for hours and months, we only ask you for 20-25 minutes or less on a daily basis for 66 days. That’s it! <br>
      </p>
      <p>
        Please note: you won’t be able to continue enrolled in the program if you miss two activities (reflections or comments on other participants’ reflections) in a given week. This is automated and there is no way to include you again after you are removed from the cohort for missing two activities. <br>
      </p>
      <p>
        Last, but not least. This cohort is starting with ${numOfParticipants} participants and they come from ${numOfCountries} countries. So, happy learning and also happy networking! <br>
      </p>
      <p>
        Enjoy the program. And please do not hesitate to reach out if you have any questions: <br>
        enrique@hackinghr.io <br>
      </p>
      <p>
        Thank you!
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
};
