import { create } from "zustand";
import { produce } from "immer";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeData from "../data/CoffeeData";
import BeansData from "../data/BeansData";

export const useStore = create(
    persist(
        (set, get) => ({
            CoffeeList: CoffeeData,
            BeanList: BeansData,
            CartPrice: 0,
            FavoritesList: [],
            CartList: [],
            OrderHistoryList: [],

            // เพิ่มสินค้าลงใน CartList โดยตรวจสอบว่า id ของสินค้าและ size ของราคามีอยู่ใน CartList แล้วหรือไม่ 
            // หากมีอยู่จะเพิ่มจำนวน (quantity) หากไม่มีจะเพิ่มรายการราคาใหม่
            addToCart: (cartItem: any) => set(produce(state => {
                let found = false;
                for (let i = 0; i<state.CartList.length; i++) {
                    if(state.CartList[i].id == cartItem.id) {
                        found = true;
                        let size = false;
                        for (let j = 0; j < state.CartList[i].prices.length; i++) {
                            if (state.CartList[i].prices[j].size == cartItem.prices[0].size) {
                                size = true;
                                state.CartList[i].prices[j].quantity++;
                                break;
                            }
                        }
                        if (size == false) {
                            state.CartList[i].prices.push(cartItem.prices[0]);
                        }
                        state.CartList[i].price.sort((a:any, b: any) => {
                            if (a.size > b.size) {
                                return -1
                            }
                            if (a.size < b.size) {
                                return 1
                            }
                            return 0
                        });
                        break;
                    }
                }
                if (found == false) {
                    state.CartList.push(cartItem);
                }
            }),
        ),

        // ฟังก์ชันนี้คำนวณราคาทั้งหมดของสินค้าที่อยู่ใน CartList และอัพเดต CartPrice
        CalculateCartPrice: () => set(produce(state => {
            let totalprice = 0;
            for(let i = 0; i < state.CartList.length; i++) {
                let tempprice = 0;
                for(let j = 0; j < state.CartList[i].prices.length; j++) {
                    tempprice = tempprice + 
                    parseFloat(state.CartList[i].prices[j].price) *
                    state.CartList[i].prices[j].quantity;
                }
                state.CartList[i].ItemPrice = tempprice.toFixed(2).toString();
                totalprice - totalprice + tempprice;
            }
            state.CartPrice = totalprice.toFixed(2).toString();
        })),

        // เพิ่มสินค้าลงใน FavoritesList โดยตรวจสอบประเภท (type) ของสินค้าและ id ของสินค้า 
        // หากพบสินค้าที่มี id ตรงกันและยังไม่เป็น favorite จะตั้งค่า favorite เป็น true และเพิ่มสินค้านั้นลงใน FavoritesList
        addToFavoriteList: (type: string, id: string) =>
            set(produce(state => {
                if(type == "Coffee") {
                    for(let i = 0; i < state.CoffeeList.length; i++) {
                        if(state.CoffeeList[i].id == id) {
                            if(state.CoffeeList[i].favourite == false) {
                                state.CoffeeList[i].favourite = true;
                                state.FavoritesList.unshift(state.CoffeeList[i]);
                            }
                            break;
                        }
                    }
                } else if (type == 'Bean') {
                    for(let i = 0; i < state.BeanList.length; i++) {
                        if(state.BeanList[i].id == id) {
                            if(state.BeanList[i].favourite == false) {
                                state.BeanList[i].favourite = true;
                                state.FavoritesList.unshift(state.BeanList[i]);
                            }
                            break;
                        }
                    }
                }
            })), 

            // ฟังก์ชันนี้ลบสินค้าจาก FavoritesList โดยตรวจสอบประเภท (type) ของสินค้าและ id ของสินค้า 
            // หากพบสินค้าที่มี id ตรงกันและเป็น favorite จะตั้งค่า favorite เป็น false และลบสินค้านั้นออกจาก FavoritesList
            deleteFromFavoriteList: (type: string, id: string) => set(produce(state => {
                if(type == 'Coffee') {
                    for(let i = 0; i < state.CoffeeList.length; i++) {
                        if(state.CoffeeList[i].id == id) {
                            if(state.CoffeeList[i].favourite == true) {
                                state.CoffeeList[i].favourite = false;
                            }
                            break;
                        }
                    }
                } else if(type == 'Beans') {
                    for(let i = 0; i < state.BeanList.length; i++) {
                        if(state.BeanList[i].id == id) {
                            if(state.BeanList[i].favourite == true) {
                                state.BeanList[i].favourite = false;
                            }
                            break;
                        }
                    }
                }
                let spliceIndex = -1;
                for (let i = 0; i < state.FavoritesList.length; i++) {
                    if(state.FavoritesList[i].id == id) {
                        spliceIndex = i;
                        break;
                    }
                }
                state.FavoritesList.splice(spliceIndex, 1);
            }))
        }), 
        {
            name: 'coffee-app', 
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
)
