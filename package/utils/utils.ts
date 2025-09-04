import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
//import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function delay(ms:number){
//   new Promise((resolve) => {
//     setTimeout(()=>{
//       resolve('')
//     }, ms);
//   })
// }

export const delay = ((ms:number)=>{
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve('')
    }, ms);
  })
})


export const hashStr = async (str: string)=> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}