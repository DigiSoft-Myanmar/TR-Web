let mongoose = require("mongoose");
let Schema = mongoose.Schema;

export let NotificationSchema = new Schema({
  title: {
    type: String,
    required: [true, "Need Title"],
  },
  body: {
    type: String,
    required: [true, "Need Body"],
  },
  image: {
    type: String,
  },
  type: {
    type: String,
    required: [true, "Need Type"],
  },
  details: {
    type: Object,
  },
  sendList: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: String,
    required: [true, "Need Created Date"],
  },
});

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
