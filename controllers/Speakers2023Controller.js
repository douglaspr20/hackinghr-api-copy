const db = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const path = require("path")
const fs = require("fs")
const moment = require("moment")
const {
    convertJSONToExcel, convertJSONToExcelBlob
  } = require("../utils/format");

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
                    speakers.map(async (user) => {
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: Number(user[0]), SpeakersPanelId: panelsSpeakers.dataValues.id},
                        })

                        if(!userReadyJoin){

                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user[2],
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user[1], panelsSpeakers.dataValues.id),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user[1],
                                        panelsSpeakers.dataValues,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );

                            await SpeakerMemberPanel.create({
                                UserId: Number(user[0]), 
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

        try {

            const panelsSpeakers = await SpeakersPanel.findAll({
                order: [["id", "DESC"]],
                where: {type: "Panels"},
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

    const allPanelSpeakersAdmin = async (req, res) => {

        try {

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
        const {usersNames, bul, panel} = data

        const { id, role } = req.user.dataValues;

        let panelsSpeakers

        try {

            if(role === "admin"){
                await Promise.all(
                    usersNames.map(async (user) => {
                        const userReadyJoin = await SpeakerMemberPanel.findOne({
                            where: { UserId: user[0], SpeakersPanelId: panel.id},
                        })
    
                        if(!userReadyJoin){
    
                            await Promise.resolve(
                                (() => {
                                    let mailOptions = {
                                    from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                                    to: user[2],
                                    subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(user[1],panel),
                                    html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                                        user[1],
                                        panel,
                                    ),
                                    };
                        
                                    return smtpService().sendMailUsingSendInBlue(mailOptions);
                                })()
                            );
    
                            await SpeakerMemberPanel.create({
                                UserId: user[0], 
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
            }else{
                const userReadyJoin = await SpeakerMemberPanel.findOne({
                    where: { UserId: id, SpeakersPanelId: panel.id},
                })

                if(userReadyJoin){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "You are ready join to this panel." });
                }

                const userLimit = await SpeakerMemberPanel.findAll({
                    where: { UserId: id },
                })

                if(userLimit.length > 1){
                    return res
                        .status(HttpCodes.BAD_REQUEST)
                        .json({ msg: "User can't join to more of two panels." });
                }

                await Promise.resolve(
                    (() => {
                        let mailOptions = {
                        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
                        to: usersNames[0][2],
                        subject: LabEmails.SPEAKERS_PANEL_JOIN.subject(usersNames[0][1],panel.panelName),
                        html: LabEmails.SPEAKERS_PANEL_JOIN.body(
                            usersNames[0][1],
                            panel,
                        ),
                        };
            
                        return smtpService().sendMailUsingSendInBlue(mailOptions);
                    })()
                );

                await SpeakerMemberPanel.create({
                    UserId: usersNames[0][0], 
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

        const { id } = req.user.dataValues;

        try {

            const user = await User.findOne({
                where: { id: id, role: "admin" },
            });
    
            if (!user) {
            return res
                .status(HttpCodes.NOT_FOUND)
                .json({ msg: "You must to be admin" });
            }

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

                await User.update({
                    registerConference2023: true
                },
                {
                    where: {
                        id: id
                    },
                })
                return res.status(HttpCodes.OK).json('funciona'); 

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

        try {
           
          const userSpeakers = await User.findAll({
            where: {
                speakersAuthorization: {[Op.eq]: "accepted"}
            },
            attributes: ["firstName","lastName","email","id", "abbrName", "img", "titleProfessions", "personalLinks"],
            order: [["firstName", "ASC"]],
          });
    
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

            await convertJSONToExcelBlob(
                nombre,
                [
                  {
                    label: "First Name",
                    value: "firstName",
                    width: 20,
                  },
                  {
                    label: "Last Name",
                    value: "lastName",
                    width: 20,
                  },
                  {
                    label: "Email",
                    value: "email",
                    width: 40,
                  },
                  {
                    label: "Role",
                    value: "role",
                    width: 20,
                  },
                  {
                    label: "Company",
                    value: "company",
                    width: 20,
                  },
                  {
                    label: "titleProfessions",
                    value: "titleProfessions",
                    width: 20,
                  },
                  {
                    label: "About",
                    value: "about",
                    width: 20,
                  },
                  {
                    label: "About",
                    value: "about",
                    width: 20,
                  },
                  {
                    label: "Timezone",
                    value: "timezone",
                    width: 40,
                  },
                  {
                    label: "Location",
                    value: "location",
                    width: 20,
                  },
                  {
                    label: "City",
                    value: "city",
                    width: 20,
                  },
                ],
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

            const panelsSpeakers = await SpeakersPanel.update({ 
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

            return res.status(HttpCodes.OK).json("funcionando");

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

            return res.status(HttpCodes.OK).json("todo bien");

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

            await SponsorsConference2023.create({
                logo,
                link,
                description,
                title,
            })

            return res.status(HttpCodes.OK).json("funciona");

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

            await SponsorsConference2023.update({ 
                logo,
                link,
                description,
                title,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json("funcionando");

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

            return res.status(HttpCodes.OK).json("todo bien");

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }

    const addParraf = async (req, res) => {

        const { parraf } = req.body;
        console.log(parraf)
        
        const { role } = req.user.dataValues;

        const { visual, type, text } = parraf

        try {
    
            if (role !== "admin") {
                return res
                    .status(HttpCodes.BAD_REQUEST)
                    .json({ msg: "You must to be admin" });
            }

            await ParrafConference2023.create({
                visual, 
                type, 
                text,
            })

            return res.status(HttpCodes.OK).json("funciona");

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

            await ParrafConference2023.update({ 
                visual,
                type, 
                text,
            },{where: {id: id}})

            return res.status(HttpCodes.OK).json("funcionando");

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

            return res.status(HttpCodes.OK).json("todo bien");

        } catch (error) {
            console.log(error);
            return res
                .status(HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ msg: "Internal server error" });
        }
    }


    return {
        addNewPanelSpeaker,
        allPanelSpeakers,
        addUserSpeakerToPanel,
        removeUserSpeakerToPanel,
        registerUserIfNotAreRegisterConference2023,
        excelAllUserRegisterConference2023,
        allPanelSpeakersAdmin,
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
    }
}

module.exports = SpeakersController;