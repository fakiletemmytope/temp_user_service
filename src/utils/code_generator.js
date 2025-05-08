import { getToken } from "./jwt.js"

export const generateCode = (maxDigits) => {
    const minDigits = 4
    if (minDigits > maxDigits || minDigits < 1 || maxDigits > 10) {
        return 0
    }

    const min = Math.pow(10, minDigits - 1)
    const max = Math.pow(10, maxDigits) - 1

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    //console.log(typeof randomNumber)
    return randomNumber
}
