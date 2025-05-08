import nodemailer from "nodemailer"
import config from "../../config.js"
import { getToken } from "./jwt.js"
import { generateCode } from "./code_generator.js"

const USERNAME = config.gmail.username
const PASSWORD = config.gmail.password
const URL = config.base_url
const transporter = nodemailer.createTransport(
    {
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: USERNAME,
            pass: PASSWORD,
        },
    }
)


const sendmail = async (recipient, subject, body) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: '"moveXpress" <admin@moveXpress.com>',
            to: recipient,
            subject: subject,
            text: body,
        }, (error, info) => {
            if (error) {
                console.log('Error occurred@sendemail:', error);
                return reject(error);
            }
            // console.log('Email sent successfully:', info.response);
            resolve(info); // Resolve the promise with the info
        });
    });
}

//


export const reg_msg = async (email, code) => {
    const msg = `Dear Customer,\n\n\nYour account has being created successfully. Your activation code is ${code}\n\nWith love from,\nXpressMove`
    await sendmail(email, "Email Activation", msg)
}


export const activation_token_req_msg = async (email, code) => {
    //const token = await getToken(payload, "20m")
    const msg = `Dear Customer,\n You requested for account activation token. Your activation code is ${code}\n\nWith love from,\nXpressMove`
    await sendmail(email, "Email Activation", msg)
}


export const pw_change_msg = async (email, first_name, code) => {
    const msg = `Dear ${first_name},\n Your requested for a password change, Your password code is ${code}\n\nWith love from,\nXpressMove`
    await sendmail(email, "Password Change Request", msg)
}