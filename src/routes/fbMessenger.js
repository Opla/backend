/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the GPL v2.0+ license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fetch from "node-fetch";
import { CommonRoutes } from "zoapp-backend";

export default class FBMessengerRoutes extends CommonRoutes {
  constructor(zoapp) {
    super(zoapp.controllers);
    this.extensions = zoapp.extensions;

    // Actually NodeJS doesn't support ES7 arrow binding so we need to bind manually
    // this.newMessage = this.newMessage.bind(this);

    this.handleMessage = this.handleMessage.bind(this);
    this.handlePostback = this.handlePostback.bind(this);
    // this.callSendAPI = this.callSendAPI.bind(this);
    // this.newMessage = this.newMessage.bind(this);
  }

  // Handles messages events
  async handleMessage(senderPsid, receivedMessage) {}

  // Handles messaging_postbacks events
  async handlePostback(senderPsid, receivedPostback) {}

  // Sends response messages via the Send API
  static async callSendAPI(senderPsid, response) {
    const PAGE_ACCESS_TOKEN =
      "EAAfE5R5E5GcBALVvkl2DUs6y4ZA4OPKsjQKNFs4KIuD9XNrq6Upq63NeK9VRq6FKCbeYr4FYTmo2YysZABN5diaZC0NeL2X2mvDZBEQq8bSV9QFLgFh1wuuiWSCZAaVRCworSxiwWvqLZC1MgkldkU3cLgs76ZABR9vh7yx5rbDQiT1brL6SZBN1To7Gp2pMijMZD";
    // Construct the message body
    const requestBody = {
      recipient: {
        id: senderPsid,
      },
      message: response,
    };

    // Send the HTTP request to the Messenger Platform
    fetch(
      `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      },
    )
      .then((res) => res.json())
      .then((json) => console.log(json));
  }

  static async newMessage(context) {
    logger.warn("post webhook");
    const { body } = context.req;
    if (body.object === "page") {
      // Iterate over each entry - there may be multiple if batched

      body.entry.forEach((entry) => {
        // for (const entry of body.entry) {
        // body.entry.forEach((entry) => {

        // Get the webhook event. entry.messaging is an array, but
        // will only ever contain one event, so we get index 0
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;
        if (webhookEvent.message && !webhookEvent.message.is_echo) {
          logger.info(webhookEvent.message);
          // handle message
          const receivedMessage = webhookEvent.message;
          if (receivedMessage.text) {
            // // ###
            // // const me = await this.access(context);
            // // const scope = context.getScope();
            // const payload = await this.extensions
            //   .getMessenger()
            //   .createMessage(senderPsid, undefined, webhookEvent.message);
            // // if (payload === null) {
            // //   return { error: "can't create message" };
            // // }
            // // return payload;
            // // ###

            // response
            const response = { text: `echo ${receivedMessage.text}` };
            // call send api
            FBMessengerRoutes.callSendAPI(senderPsid, response);
          }
        }
      });
      // this.extensions;

      // Return a '200 OK' response to all events
      // context.res.status(200).send("EVENT_RECEIVED");
      return "EVENT_RECEIVED";
    }
    // context.res.sendStatus(404);
    return "ERROR";
  }
}
