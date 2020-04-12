import { Document, Model, Schema } from "mongoose";
import { autoIncrement } from "mongoose-plugin-autoinc";
import { db } from "../util/db";

export interface ICustomColorDocument extends Document {
    key: string;
    user: string;
    color: string;
}

export interface ICustomColor extends ICustomColorDocument {
}

export interface ICustomColorModel extends Model<ICustomColorDocument> {
    getColorForType(user: string, type: string): Promise<string | undefined>;
}

const CustomColorSchema = new Schema({
    key: { type: String, required: true },
    user: { type: String, required: true },
    color: { type: String, required: true }
}, { collection: "customColors" });

CustomColorSchema.plugin(autoIncrement, {
    model: "CustomColor",
    startAt: 1
});

CustomColorSchema.statics.getColorForType = async function(user: string, type: string) {
    const match = await this.findOne({ key: type });
    return match?.color;
};

export const CustomColor: ICustomColorModel = db.model<ICustomColor, ICustomColorModel>("CustomColor", CustomColorSchema);
