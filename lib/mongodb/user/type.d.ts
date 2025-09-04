export type UserType = {
    _id: string,
    username: string,
    phone: string,
    password: string,
    createTime: Date,
    updateTime: Date,
}

export type UserModelSchema = UserType & {
    __v: number
}