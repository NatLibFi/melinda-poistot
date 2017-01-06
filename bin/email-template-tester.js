import {ReportEmail} from '../server/email-template';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import { mail } from '../server/mailer';

const taskResults = Array.from({length: 1000}).map(generateRandomTaskResult);

const str = ReactDOMServer.renderToStaticMarkup(<ReportEmail taskResults={taskResults} />);

const sendEmail = false;

if (sendEmail) {
  mail({
    to: 'pasi@muunne.fi',
    subject: 'Melinda job [FAKE_RESULT_JOB_ID] completed',
    html: str
  }).then(info => {
    console.log('message sent', info); 
  }).catch(error => {
    console.log('Failed to send email', error);
  });
} else {
  console.log(str);  
}

function generateRandomTaskResult() {

  return {
    recordId: randomMelindaId(),
    lowTag: 'TEST',
    recordIdHints: {
      localId: randomLocalId()
    },
    taskFailed: randomTrueEveryFifth(),
    failureReason: randomFailureReason(),

    report: Array.from({length: biasedRandomFrom0to3()}).map(randomReportMessage),

    updateResponse: {
      messages: [randomUpdateResponseMessage()]
    }
  };
  
}

function biasedRandomFrom0to3() {
  if (Math.random() > 0.5) {
    return 0;
  }
  
  if (Math.random() > 0.5) {
    return 1;
  }
  
  if (Math.random() > 0.5) {
    return 2;
  }
  
  return 3;

}

function randomMelindaId() {
  return _.padStart(Math.floor(Math.random()*10000000),11,0);
}

function randomLocalId() {
  return Math.floor(Math.random()*100000);
}

function randomTrueEveryFifth() {
  return Math.random() > 0.8;
}


function randomFailureReason() {
  const errorMessages = [
    'Resolved into 0 records.',
    'The record has unexpected SIDc value',
    'The record is deleted.'
  ];

  return errorMessages[Math.floor(Math.random()*errorMessages.length)];
}

function randomUpdateResponseMessage() {
  return {code: 20, message: 'Document XYZ updated succesfully'};
}

function randomReportMessage() {

  const reportMessages = [
    'Record was deleted.',
    'Record did not have LOW tag.',
    'Removed LOW: TEST',
    'Removed SID: test',
    'Removed subfield 9 with value TEST <DROP> from field 245',
    'Removed subfield 5 with value TEST from field 301',
    'Removed field 300'
  ];

  return reportMessages[Math.floor(Math.random()*reportMessages.length)];
}