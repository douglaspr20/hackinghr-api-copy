const db = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const path = require("path")
const fs = require("fs")
const moment = require("moment")
const {formatExcelUsers} = require("../utils/formatExportUsersExcel.js")
const {formatExcelPanels} = require("../utils/formatExportPanelsExcel.js")
const {
    convertJSONToExcelUsersSpeakers2023,
    convertJSONToExcelPanelsConference2023
  } = require("../utils/format");
  const { convertToLocalTime } = require("../utils/format");

const User = db.User;
const SpeakersPanel = db.SpeakerPanel;
const SpeakerMemberPanel = db.SpeakerMemberPanel
const SponsorsConference2023 = db.SponsorsConference2023
const ParrafConference2023 = db.ParrafConference2023

const SpeakersController = () => {

    const addNewPanelSpeaker = async (req, res) => {

        const { panels } = req.body;
        
        const { id, role } = req.user.dataValues;

        const { description, endDate, startDate, timeZone, panelName, type, category, objetives, link, recertificactionCredits, metaData, speakers } = panels

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const panelsSpeakers = await SpeakersPanel.create({
                OwnerId: id, 
                metaData,
                recertificactionCredits,
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName,
                link,
                objetives,
                category,
                type
            },{order: [["id", "DESC"]]})

            if(speakers?.length !== 0 && speakers !== undefined){
                await Promise.all(
                    speakers.map(async (data) => {
                        const user = JSON.parse(data)

                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: Number(user.userId), SpeakersPanelId: panelsSpeakers.dataValues.id},
                        })

                        if(!userReadyJoin){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user.userEmail,
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user.userName, panelsSpeakers.dataValues.id),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user.userName,
                                        panelsSpeakers.dataValues,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );

                            await SpeakerMemberPanel.create({
                                UserId: Number(user.userId), 
                                SpeakersPanelId: panelsSpeakers.dataValues.id, 
                                isModerator: false, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const allPanelSpeakers = async (req, res) => {

        const type = req.params

        let panelsSpeakers

        try {

            if(type.type !== "All"){
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["startDate", "ASC"]],
                    where: {type: type.type},
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }else{
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["startDate", "ASC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const panelForId = async (req, res) => {
        const {id} = req.params
        try {
           
            const userSpeakers = await SpeakersPanel.findOne({
              where: {
                  id: id
              },
              include: [
                {
                    model: SpeakerMemberPanel,
                    include: [
                        {
                            model: User,
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "titleProfessions",
                                "img",
                                "abbrName"
                            ],
                        }
                    ]
                }
            ],
            });
      
            return res.status(HttpCodes.OK).json({ userSpeakers });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    };

    const addUserSpeakerToPanel = async (req, res) => {
        const { data } = req.body;
        const {usersNames, bul, panel, type} = data

        const { id, role } = req.user.dataValues;

        let panelsSpeakers

        const moderators = await SpeakerMemberPanel.findAll({
            where: {SpeakersPanelId: panel.id, isModerator: true},
            include: [
                {
                    model: User,
                    attributes: [
                        "id",
                        "email"
                    ],
                }
            ],
        })

        const emailsModerators = moderators.map((moderator) => {return moderator.User.email})

        try {

            if(role === "admin" && type === "addUserAdmin"){
                await Promise.all(
                    usersNames.map(async (data) => {
                        const user = JSON.parse(data)
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: user.userId, SpeakersPanelId: panel.id},
                        })
    
                        if(!userReadyJoin){
    
                            if(bul){

                                await Promise.resolve(
                                    (() => {
                                        let mailOptions = {
                                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                        to: user.userEmail,
                                        cc: emailsModerators,
                                        subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.subject(user.userName,panel.panelName),
                                        html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR.body(
                                            user.userName,
                                            panel,
                                        ),
                                    };
                            
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);

                                    })()
                                );

                            }else{

                                await Promise.resolve(
                                    (() => {
                                        let mailOptions = {
                                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                        to: user.userEmail,
                                        cc: emailsModerators,
                                        subject: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN.subject(user.userName,panel.panelName),
                                        html: LabEmails.SPEAKERS_PANEL_JOIN_FOR_ADMIN.body(
                                            user.userName,
                                            panel,
                                        ),
                                    };
                            
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);

                                    })()
                                );  

                            }
                            
                            await SpeakerMemberPanel.create({
                                UserId: user.userId, 
                                SpeakersPanelId: panel.id, 
                                isModerator: bul, 
                            }) 
                        }else{
                            return res
                            .status(HttpCodes.INTERNAL_SERVER_ERROR)
                            .json({ msg: `Users has already been added.` });
                        }
                        
                    })
                );
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }
            if(type === "joinUser"){

                const userReadyJoin = await SpeakerMemberPanel.findOne({
                    where: { UserId: id, SpeakersPanelId: panel.id},
                })

                if(userReadyJoin){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You are ready join to this panel." });
                }

                if(role !== "admin"){
                    const userLimit = await SpeakerMemberPanel.findAll({
                        where: { UserId: id },
                    })

                    if(userLimit.length > 1){
                        return res
                            .status(HttpCodes.BAD_REQUEST)
                            .json({ msg: "You can't join more than two panels." });
                    }
                }

                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                            to: usersNames.userEmail,
                            cc: emailsModerators,
                            subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(usersNames.userName,panel.panelName),
                            html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                usersNames.userName,
                                panel,
                            ),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                await SpeakerMemberPanel.create({
                    UserId: usersNames.userId, 
                    SpeakersPanelId: panel.id, 
                    isModerator: bul, 
                })
    
                panelsSpeakers = await SpeakersPanel.findAll({
                    order: [["id", "DESC"]],
                    include: [
                        {
                            model: SpeakerMemberPanel,
                            include: [
                                {
                                    model: User,
                                    attributes: [
                                        "id",
                                        "firstName",
                                        "lastName",
                                        "titleProfessions",
                                        "img",
                                        "abbrName"
                                    ],
                                }
                            ]
                        }
                    ],
                })
            }

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const removeUserSpeakerToPanel = async (req, res) => {
        const { UserId } = req.body;

        try {

            await SpeakerMemberPanel.destroy({
                where:{ id: UserId}
            })

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "id",
                                    "firstName",
                                    "lastName",
                                    "titleProfessions",
                                    "img",
                                    "abbrName"
                                ],
                            }
                        ]
                    }
                ],
            })

            return res.status(HttpCodes.OK).json({ panelsSpeakers });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const registerUserIfNotAreRegisterConference2023 = async (req, res) => {

        const { email, firstName, id, registerConference2023 } = req.user.dataValues;

        try{
        
            if(!registerConference2023){
                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: email,
                        subject: LabEmails.REGISTER_CONFERENCE_2023.subject(),
                        html: LabEmails.REGISTER_CONFERENCE_2023.body(firstName),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                const [numberOfAffectedRows, affectedRows] = await User.update({
                    registerConference2023: true
                },
                {
                    where: {
                        id: id
                    },
                })
                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows }); 

            }else{
                return res.status(HttpCodes.OK); 
            }  
        }catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    };

    const getAllUserSpeaker = async (req, res) => {

        const {type} = req.params
        let userSpeakers

        try {
           
            if(type === "tableSpeakers"){
                userSpeakers = await User.findAll({
                    where: {
                        [Op.or]: [
                            {speakersAuthorization: {[Op.eq]: "accepted"}},
                            {speakersAuthorization: {[Op.eq]: "pending"}},
                            {speakersAuthorization: {[Op.eq]: "reject"}}
                        ]
                    },
                    attributes: [
                        "firstName",
                        "lastName",
                        "email",
                        "id",
                        "abbrName",
                        "img",
                        "titleProfessions",
                        "personalLinks",
                        "speakersAuthorization",
                        "role",
                        "about",
                        "city",
                        "location",
                        "timezone",
                        "company"
                    ],
                    order: [["firstName", "ASC"]],
                });
            }else{
                userSpeakers = await User.findAll({
                    where: {
                        speakersAuthorization: {[Op.eq]: "accepted"}
                    },
                    attributes: [
                        "firstName",
                        "lastName",
                        "email",
                        "id",
                        "abbrName",
                        "img",
                        "titleProfessions",
                        "personalLinks",
                        "speakersAuthorization",
                        "role",
                        "about",
                        "city",
                        "location",
                        "timezone",
                        "company"
                    ],
                    order: [["firstName", "ASC"]],
                });
            }
    
            return res.status(HttpCodes.OK).json({ userSpeakers });
        } catch (error) {
          console.log(error);
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
    };

    const excelAllUserRegisterConference2023 = async (req, res) => {

        try{

            const allUserConference = await User.findAll({where: {registerConference2023: true}})

            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelUsersSpeakers2023(
                nombre,
                formatExcelUsers,
                allUserConference.map((user) => user.toJSON())
            );

            await res.status(HttpCodes.OK).download(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`, function(){
                fs.unlinkSync(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`)
            })

        }catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
        }
    }

    const excelAllPanelsRegisterConference2023 = async (req, res) => {
        try{

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["startDate", "ASC"]],
                include: [
                    {
                        model: SpeakerMemberPanel,
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "firstName",
                                    "lastName",
                                    "email",
                                    "role",
                                    "company",
                                    "titleProfessions",
                                    "about",
                                    "about",
                                    "timezone",
                                    "location",
                                    "city",
                                ],
                            }
                        ]
                    }
                ],
            })

            const nombre = moment().format("MM-DD-HH-mm-s")

            await convertJSONToExcelPanelsConference2023(
                nombre,
                formatExcelPanels,
                formatExcelUsers,
                panelsSpeakers.map((panels) => panels.toJSON())
            );

            await res.status(HttpCodes.OK).download(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`, function(){
                fs.unlinkSync(`${path.join(__dirname, '../utils')}/${nombre}.xlsx`)
            })

        }catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
        }
    }

    const getAllPanelsOfOneUser = async (req, res) => {

        const {id} = req.params

        try {
           
            const userSpeakers = await SpeakerMemberPanel.findAll({
              where: {
                  UserId: id
              },
              include: [
                    {
                        model: SpeakersPanel,
                    }
                ],
            });
      
            return res.status(HttpCodes.OK).json({ userSpeakers });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editPanelsSpeaker2023 = async (req, res) => {

        const { panels } = req.body;

        const { role } = req.user.dataValues;

        const { description, endDate, startDate, timeZone, panelName, type, category, objetives, link, recertificactionCredits, metaData, PanelId } = panels
        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                metaData,
                recertificactionCredits,
                description, 
                endDate, 
                startDate, 
                timeZone, 
                panelName,
                link,
                objetives,
                category,
                type
            },{where: {id: PanelId}})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deletePanelsSpeaker2023 = async (req, res) => {

        const { PanelId } = req.params;

        const { role } = req.user.dataValues;

        try {

            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await SpeakersPanel.destroy({where: {id: PanelId}})

            return res.status(HttpCodes.OK).json({});

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addSponsor = async (req, res) => {

        const { sponsor } = req.body;
        
        const { role } = req.user.dataValues;

        const { logo, link, description, title } = sponsor

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const sponsorCreate = await SponsorsConference2023.create({
                logo,
                link,
                description,
                title,
            })

            return res.status(HttpCodes.OK).json({sponsorCreate})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }

    }

    const getAllSponsor = async (req, res) => {
        try {

            const sponsor = await SponsorsConference2023.findAll({
                order: [["id", "DESC"]]
            })

            return res.status(HttpCodes.OK).json({ sponsor });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getOneSponsor = async (req, res) => {
        const {SponsorId} = req.params
        try {
           
            const sponsor = await SponsorsConference2023.findOne({
              where: {
                  id: SponsorId
              }
            });
      
            return res.status(HttpCodes.OK).json({ sponsor });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editSponsor = async (req, res) => {
        const { sponsor } = req.body;

        const { role } = req.user.dataValues;

        const { logo, link, description, title, id } = sponsor
        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await SponsorsConference2023.update({ 
                logo,
                link,
                description,
                title,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deleteSponsor = async (req, res) => {
        const { SponsorId } = req.params;

        const { role } = req.user.dataValues;

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await SponsorsConference2023.destroy({where: {id: SponsorId}})

            return res.status(HttpCodes.OK).json({});

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addParraf = async (req, res) => {

        const { parraf } = req.body;
        
        const { role } = req.user.dataValues;

        const { visual, type, text } = parraf

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const parrafCreate = await ParrafConference2023.create({
                visual, 
                type, 
                text,
            })

            return res.status(HttpCodes.OK).json({parrafCreate})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }

    }

    const getAllParraf = async (req, res) => {
        try {

            const parraf = await ParrafConference2023.findAll({
                order: [["id", "DESC"]]
            })

            return res.status(HttpCodes.OK).json({ parraf });

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const getOneParraf = async (req, res) => {
        const {ParrafId} = req.params
        try {
           
            const parraf = await ParrafConference2023.findOne({
              where: {
                  id: ParrafId
              }
            });
      
            return res.status(HttpCodes.OK).json({ parraf });
          } catch (error) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    }

    const editParraf = async (req, res) => {
        const { parraf } = req.body;

        const { role } = req.user.dataValues;

        const { visual, type, text, id } = parraf
        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            const [numberOfAffectedRows, affectedRows] = await ParrafConference2023.update({ 
                visual,
                type, 
                text,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const deleteParraf = async (req, res) => {
        const { ParrafId } = req.params;

        const { role } = req.user.dataValues;

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await ParrafConference2023.destroy({where: {id: ParrafId}})

            return res.status(HttpCodes.OK).json({})

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addToMyPersonalAgenda = async (req, res) => {
        const { data } = req.body;

        const { id } = req.user.dataValues

        let { PanelId, type, startTime, endTime } = data

        let newArray = [];

        try {

            const lastArrayOfThisColumn = await SpeakersPanel.findOne({where: {id: PanelId}, attributes:["usersAddedToThisAgenda"]})

            if(startTime !== undefined){
                const sessionCompareTime = await SpeakersPanel.findAll({where: 
                    {
                        [Op.or]: [
                            {
                                startDate: {
                                    [Op.lte]: startTime
                                },
                                endDate: {
                                    [Op.gte]: startTime,
                                }, 
                            }, 
                            {
                                startDate: {
                                    [Op.lte]: endTime
                                },
                                endDate: {
                                    [Op.gte]: endTime,
                                }, 
                            },
                            
                        ],
                        usersAddedToThisAgenda: [id],
                    }
                })

                if(sessionCompareTime.length !== 0){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You already registered for a session on this same date and same time, You can't register for two sessions on the same date and same time."});
                }
            }

            if(type === "Remove"){
                
                newArray = await lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda

                await Promise.all(
                    lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda.map((idArray,index) => {
                        if(Number(idArray) === Number(id)){
                            newArray.splice(index,1)
                            return
                        }
                    })  
                );

                const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                    usersAddedToThisAgenda: newArray
                },{where: {id: PanelId}})

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            }

            if(type === "Added"){

                await lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda.push(id)
                newArray = lastArrayOfThisColumn.dataValues.usersAddedToThisAgenda

                const [numberOfAffectedRows, affectedRows] = await SpeakersPanel.update({ 
                    usersAddedToThisAgenda: newArray
                },{where: {id: PanelId}})

                return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })
            }

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addNewSpeakersAdmin = async (req, res) => {
        const {userIds} = req.body

        try {

            await Promise.all(
                userIds.map(async (id) => {
                    await User.update(
                        {
                            speakersAuthorization: "accepted",
                        },
                        {
                            where: { id: id },
                        }
                    );
                })
            )

            return res.status(HttpCodes.OK).json()

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const editAuthorizationSpeakers = async (req, res) => {
        const {data} = req.body

        try {

            const [numberOfAffectedRows, affectedRows] = await User.update(
                {
                    speakersAuthorization: data.type,
                },
                {
                    where: { id: data.userData.id },
                }
            );

            if(data.type === "accepted"){
                await Promise.resolve(
                    (() => {
                      let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: data.userData.email,
                        //to: "enrique@hackinghr.io",
                        subject: LabEmails.USER_ACCEPTED_SPEAKER.subject(data.userData.firstName),
                        html: LabEmails.USER_ACCEPTED_SPEAKER.body(
                            data.userData,
                          `${process.env.DOMAIN_URL}speakers2023`
                        ),
                      };
          
                      return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );
            }

            return res.status(HttpCodes.OK).json({ numberOfAffectedRows, affectedRows })

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const downloadICS = async (req, res) => {
        const { id } = req.params;
        const { userTimezone } = req.query;
    
        try {
          const panel = await SpeakersPanel.findOne({
            where: { id },
          });
    
          if (!panel) {
            console.log(error);
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
    
          let startTime = convertToLocalTime(
            panel.dataValues.startDate,
            panel.dataValues.timeZone,
            userTimezone
          );
          let endTime = convertToLocalTime(
            panel.dataValues.endDate,
            panel.dataValues.timeZone,
            userTimezone
          );
    
          const calendarInvite = smtpService().generateCalendarInvite(
            startTime,
            endTime,
            panel.panelName,
            panel.description,
            "https://www.hackinghrlab.io/global-conference",
            // event.location,
            `${process.env.DOMAIN_URL}${panel.id}`,
            "hacking Lab HR",
            process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            userTimezone
          );
    
          let icsContent = calendarInvite.toString();
          icsContent = icsContent.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );
    
          res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename=${encodeURIComponent(panel.panelName)}.ics`
          );
          res.setHeader("Content-Length", icsContent.length);
          return res.end(icsContent);
        } catch (error) {
          console.log(error);
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
    };

    return {
        addNewPanelSpeaker,
        addNewSpeakersAdmin,
        addToMyPersonalAgenda,
        allPanelSpeakers,
        editAuthorizationSpeakers,
        addUserSpeakerToPanel,
        removeUserSpeakerToPanel,
        registerUserIfNotAreRegisterConference2023,
        excelAllUserRegisterConference2023,
        excelAllPanelsRegisterConference2023,
        getAllUserSpeaker,
        getAllPanelsOfOneUser,
        panelForId,
        editPanelsSpeaker2023,
        deletePanelsSpeaker2023,
        addSponsor,
        getAllSponsor,
        getOneSponsor,
        editSponsor,
        deleteSponsor,
        addParraf,
        getAllParraf,
        getOneParraf,
        editParraf,
        deleteParraf,
        downloadICS
    }
}

module.exports = SpeakersController;
