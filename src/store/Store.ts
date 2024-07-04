import { create } from "zustand";
import { produce } from "immer";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoffeeData from "../data/CoffeeData";
import BeansData from "../data/BeansData";
import FavoritesScreen from "../screens/FavoritesScreen";

export const useStore = create(
    persist(
        (set, get) => ({
            CoffeeList: CoffeeData,
            BeanList: BeansData,
            CartPrice: 0,
            FavoritesList: [],
            CartList: [],
            OrderHistoryList: [],

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

        addToFaveriteList: (type: string, id: string) =>
            set(produce(state => {
                if(type == "Coffee") {
                    for(let i = 0; i < state.CoffeeList.length; i++) {
                        if(state.CoffeeList[i].id == id) {
                            if(state.CoffeeList[i].favorite == false) {
                                state.CoffeeList[i].favorite == true;
                                state.FavoritesList.unshift(state.CoffeeList[i]);
                            }
                            break;
                        }
                    }
                } else if (type == 'Bean') {
                    for(let i = 0; i < state.BeanList.length; i++) {
                        if(state.BeanList[i].id == id) {
                            if(state.BeanList[i].favorite == false) {
                                state.BeanList[i].favorite == true;
                                state.FavoritesList.unshift(state.BeanList[i]);
                            }
                            break;
                        }
                    }
                }
            })), 

            deleteFromFavoriteList: (type: string, id: string) => set(produce(state => {
                if(type == 'Coffee') {
                    for(let i = 0; i < state.CoffeeList.length; i++) {
                        if(state.CoffeeList[i].id == id) {
                            if(state.CoffeeList[i].favorite == true) {
                                state.CoffeeList[i].favorite == false;
                            }
                            break;
                        }
                    }
                } else if(type == 'Beans') {
                    for(let i = 0; i < state.BeanList.length; i++) {
                        if(state.BeanList[i].id == id) {
                            if(state.BeanList[i].favorite == true) {
                                state.BeanList[i].favorite == false;
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
