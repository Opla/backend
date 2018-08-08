/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the GPL v2.0+ license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class FbMessengerConnectorMiddleware {
  constructor(controllers) {
    this.controllers = controllers;
    this.classes = ["messenger", "bot", "sandbox"];
    // this.classes = ["messenger", "bot", "sandbox"];
    this.name = "fb-messenger";
    this.onDispatch = this.onDispatch.bind(this);
    logger.warn("fb-messenger middleware");
    // this.initChannels();
    this.initMessenger();
  }

  async initMessenger() {
    const controller = this.getMiddlewaresController();
    const middlewares = await controller.list(null, "MessengerConnector");
    logger.warn("list of middlewares messengerconnector:", middlewares);

    if (Array.isArray(middlewares) && middlewares.length > 0) {
      middlewares.forEach((channel) => {
        logger.info("init register messenger channel=", channel);
        controller.register(channel);
      });
    }
  }

  async onDispatch(className, data) {
    logger.info("fb middleware onDispatch", className, data);
    switch (data.action) {
      case "publishBot":
        await this.publishBot(data);
        break;
      default:
        break;
    }
  }

  getMiddlewaresController() {
    return this.controllers.zoapp.controllers.getMiddlewares();
  }

  getProperties() {
    return {
      name: this.name,
      classes: this.classes,
      status: "start",
      onDispatch: this.onDispatch,
    };
  }
}
