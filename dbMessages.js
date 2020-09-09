import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
});

export default mongoose.model("messagecontents", whatsappSchema);
// Give a name to our collection on .model('') and use whatsappschema for the colelction
