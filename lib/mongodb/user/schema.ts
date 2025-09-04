import { UserModelSchema } from "./type"
import { connectionMongo ,getMongoModel} from '../../../package/mongo'
import {hashStr} from '../../../package/utils/utils'
const {Schema} = connectionMongo

export const userCollectionName = 'users'

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        get: (v: string) => hashStr(v),
        set: (v: string) => hashStr(v),
        select: false,
    },
    createTime: {
        type: Date,
        default: Date.now,
    },
    updateTime: {
        type: Date,
        default: Date.now,
    },
})

try{
    UserSchema.index({
        createTime: 1,
    })
}catch(error){
    console.log('create index error', error)
}

export const MongoUser = getMongoModel<UserModelSchema>(userCollectionName, UserSchema)
