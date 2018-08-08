/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the GPL v2.0+ license found in the
 * LICENSE file in the root directory of this source tree.
 */
import MessengerController from "./messenger";

export default class extends MessengerController {
  constructor(name, main, className = null) {
    super(name, main, className);
  }

  async validateChallenge(challenge, token) {
    const secretToken = "";
    // if(token === secretToken){
    // }
    const conversations = await this.getConversations(user, 0, botId, false);
    let conversation = null;
    if (conversations.length === 0) {
      conversation = await this.buildBotConversation(user, botId);
    } else {
      [conversation] = conversations;
    }
    return conversation;
  }
}
