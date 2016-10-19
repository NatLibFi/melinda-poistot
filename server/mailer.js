import nodemailer from 'nodemailer';
import { readEnvironmentVariable } from './utils';
import _ from 'lodash';

const SMTP_CONNECTION_URL = readEnvironmentVariable('SMTP_CONNECTION_URL');
const SMTP_FROM_EMAIL = readEnvironmentVariable('SMTP_FROM_EMAIL', 'noreply@melinda.kansalliskirjasto.fi');
const SMTP_CC_ADDRESS = readEnvironmentVariable('SMTP_CC_ADDRESS', '');
const transporter = nodemailer.createTransport(SMTP_CONNECTION_URL);

export function mail(mailOptions) {
  const opts = _.assign({}, mailOptions, {
    from: SMTP_FROM_EMAIL,
    cc: SMTP_CC_ADDRESS
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(opts, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}
