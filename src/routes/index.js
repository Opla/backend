/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the GPL v2.0+ license found in the
 * LICENSE file in the root directory of this source tree.
 */
// import fetch from "node-fetch";
import BotsRoutes from "./bots";
import ConversationsRoutes from "./conversations";
import MetricsRoutes from "./metrics";
import AdminRoute from "./admin";
import FBMessengerRoutes from "./fbMessenger";

export default (zoapp) => {
  const conversations = new ConversationsRoutes(zoapp);
  const bots = new BotsRoutes(zoapp);
  const metrics = new MetricsRoutes(zoapp);
  const admin = new AdminRoute(zoapp);
  const fbMessenger = new FBMessengerRoutes(zoapp);
  // const fbMessengerRoute = new FBMessengerRoute(zoapp);

  // /conversations routes
  // List all conversations linked to session
  let route = zoapp.createRoute("/conversations");
  route.add("GET", "", ["*", "admin", "master"], conversations.conversations);
  // Get a conversation from its id
  route.add(
    "GET",
    "/:conversationId",
    ["*", "admin", "master"],
    conversations.conversationById,
  );
  // Create a conversation
  route.add(
    "POST",
    "",
    ["*", "admin", "master"],
    conversations.newConversation,
  );
  // Get conversation's messages from its id
  route.add(
    "GET",
    "/:conversationId/messages",
    ["*", "admin", "master"],
    conversations.conversationMessages,
  );
  // Publish a new message in a conversation
  route.add(
    "POST",
    "/:conversationId/messages",
    ["*", "admin", "master"],
    conversations.newMessage,
  );

  // route = zoapp.createRoute("/fb");
  // // facebook messenger callback url
  // route.add(
  //   "GET",
  //   "/webhook",
  //   ["*", "open"],
  //   (context) => {
  //     logger.warn("get webhook");
  //     logger.warn("context params", context.getParams());
  //     const query = context.getQuery();
  //     logger.warn("context query", query);
  //     logger.warn("context query hub.challenge", query["hub.challenge"]);
  //     logger.warn("context body", context.getBody());
  //     logger.warn("context", typeof context);
  //     logger.warn(Object.keys(context));
  //     logger.warn(context.access);
  //     if (query && query["hub.verify_token"] === "token943") {
  //       const c = query["hub.challenge"];
  //       return parseInt(c, 10);
  //       // return JSON.stringify(c);
  //     }
  //     return "error on token";
  //   },
  //   () => true,
  // );

  route = zoapp.createRoute("/fb");
  // facebook messenger callback url
  route.add(
    "GET",
    "/webhook",
    ["*", "open"],
    (context) => {
      const verifyToken = "token943";
      logger.warn("get webhook");
      const query = context.getQuery();
      if (query && query["hub.verify_token"] === verifyToken) {
        const c = query["hub.challenge"];
        return parseInt(c, 10);
        // return JSON.stringify(c);
      }
      return "error on token";
    },
    () => true,
  );

  route.add("POST", "/webhook", ["*", "open"], fbMessenger.newMessage);

  // /bots routes
  route = zoapp.createRoute("/bots");
  // Bot create (No auth)
  route.add("POST", "", ["open"], bots.createBot);
  // bot params
  route.add("GET", "/params/:name", ["open"], bots.getParameters);
  // bot update
  route.add("PUT", "/:botId", ["owner", "admin", "master"], bots.updateBot);

  // get bots
  route.add("GET", "", ["owner", "admin", "master"], bots.getBots);
  // get bot
  route.add(
    "GET",
    "/:botId",
    ["owner", "admin", "master", "default", "anonymous"],
    bots.getBot,
  );

  // bot import
  route.add(
    "POST",
    "/:botId/import",
    ["owner", "admin", "master"],
    bots.import,
  );
  // bot publish
  route.add(
    "POST",
    "/:botId/publish",
    ["owner", "admin", "master"],
    bots.publish,
  );

  // bot get intents
  route.add(
    "GET",
    "/:botId/intents",
    ["owner", "admin", "master"],
    bots.intents,
  );
  // bot get intents
  route.add(
    "GET",
    "/:botId/intents/:version",
    ["owner", "admin", "master"],
    bots.intents,
  );
  // bot create intents
  route.add(
    "POST",
    "/:botId/intents",
    ["owner", "admin", "master"],
    bots.newIntent,
  );
  // bot update an intent
  route.add(
    "PUT",
    "/:botId/intents/:intentId",
    ["owner", "admin", "master"],
    bots.updateIntent,
  );
  // bot update intents
  route.add(
    "PUT",
    "/:botId/intents",
    ["owner", "admin", "master"],
    bots.updateIntents,
  );
  // bot move an intent
  route.add(
    "PUT",
    "/:botId/intents/:intentId/move",
    ["owner", "admin", "master"],
    bots.moveIntent,
  );
  // bot delete an intent
  route.add(
    "DELETE",
    "/:botId/intents/:intentId",
    ["owner", "admin", "master"],
    bots.removeIntent,
  );

  // /bots/sandbox sandbox get messages
  route.add(
    "GET",
    "/:botId/sandbox/messages",
    ["owner", "admin", "master"],
    bots.sandboxMessages,
  );
  // bot sandbox new message
  route.add(
    "POST",
    "/:botId/sandbox/messages/:conversationId",
    ["owner", "admin", "master", "default"],
    bots.sandboxNewMessage,
  );
  // bot sandbox update messages
  route.add(
    "PUT",
    "/:botId/sandbox/messages/:conversationId",
    ["owner", "admin", "master", "default"],
    bots.sandboxUpdateMessages,
  );
  // bot sandbox delete message
  route.add(
    "DELETE",
    "/:botId/sandbox/messages/:conversationId",
    ["owner", "admin", "master", "default"],
    bots.sandboxDeleteMessage,
  );
  // bot sandbox get context
  route.add(
    "GET",
    "/:botId/sandbox/context",
    ["owner", "admin", "master"],
    bots.sandboxGetContext,
  );
  // bot sandbox reset
  route.add(
    "DELETE",
    "/:botId/sandbox",
    ["owner", "admin", "master"],
    bots.sandboxReset,
  );

  // Websocket services
  route = `${zoapp.endpoint}/bots/sandbox/messages`;
  zoapp.addWSRoute(
    route,
    ["*", "owner", "admin", "master"],
    ["sandbox"],
    "newMessages",
    async (event, channelId, data, ws) => {
      let response = null;
      // logger.info("sandbox WS", event, channelId);
      if (
        event === "newMessages" ||
        event === "updateConversation" ||
        event === "subscribe"
      ) {
        // logger.info("get me", ws.access);
        const me = await zoapp.controllers.getMe(ws.access.user_id);
        // logger.info("me=", me);
        if (me && channelId) {
          // logger.info("sandbox getFullBotConversations=", channelId);
          const cs = await zoapp.extensions
            .getSandboxMessenger()
            .getFullBotConversations(me, channelId);
          // logger.info("sandbox done getFullBotConversations=", channelId);
          response = { event: "newMessages", result: cs };
        }
      }
      return response;
    },
  );

  route = `${zoapp.endpoint}/conversations/messages`;
  zoapp.addWSRoute(
    route,
    ["*", "owner", "admin", "master", "anonymous"],
    ["messenger"],
    "newMessages",
    async (event, channelId, data, ws) => {
      let response = null;
      if (event === "newMessages" || event === "subscribe") {
        const me = await zoapp.controllers.getMe(ws.access.user_id);
        if (me && channelId) {
          const conversation = await zoapp.extensions
            .getMessenger()
            .getConversation(me, channelId);
          // logger.info("messenger getConversation=", conversation);
          let cs = null;
          if (conversation) {
            const messages = await zoapp.extensions
              .getMessenger()
              .getConversationMessages(channelId);
            cs = [{ messages, ...conversation }];
          }
          response = { event: "newMessages", result: cs };
        }
      }
      return response;
    },
  );

  // /metrics routes
  route = zoapp.createRoute("/metrics");
  route.add("GET", "/:botId", ["*", "admin", "master"], metrics.getForBot);

  // /admin routes
  route = zoapp.createRoute("/admin");
  route.add("GET", "/templates", ["open"], admin.getTemplates);
  route.add("GET", "/languages", ["open"], admin.getLanguages);
};
