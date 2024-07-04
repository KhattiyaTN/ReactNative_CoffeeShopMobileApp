import React, { useState, useRef } from 'react'
import { Dimensions, FlatList, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableOpacityBase, View } from 'react-native'
import { useStore } from '../store/Store'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from 'react-native-screens';
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import CustomIcon from '../components/CustomIcon';
import CoffeeCard from '../components/CoffeeCard';

const getCategoriesFromData = (data: any) => {
    let temp: any = {};
    for (let i = 0; i < data.length; i++) {
        if (temp[data[i].name] == undefined) {
            temp[data[i].name] = 1;
        } else {
            temp[data[i].name]++
        }
    }
    let categories = Object.keys(temp);
    categories.unshift('All');
    return categories;
};

const getCoffeeList = (category: string, data: any) => {
    if (category == 'All') {
        return data;
    } else {
        let coffeelist = data.filter((item: any) => item.name == category)
        return coffeelist;
    }
}

const HomeScreen = ({navigation}: any) => {
    const CoffeeList = useStore((state: any) => state.CoffeeList);
    const BeanList = useStore((state: any) => state.BeanList);

    const [categories, setCategories] = useState(
        getCategoriesFromData(CoffeeList),
    );
    const [searchText, setSearchText] = useState('');
    const [categoryIndex, setCategoryIndex] = useState({
        index: 0,
        category: categories[0],
    });
    const [sortedCoffee, setSortedCoffee] = useState(
        getCoffeeList(categoryIndex.category, CoffeeList)
    );

    const ListRef: any = useRef<FlatList>();
    const tabBarHeight = useBottomTabBarHeight();

    const searchCoffee = (search: string) => {
        if (search != '') {
            ListRef?.current?.scrollToOffset({
                animated: true,
                offset: 0,
            });
            setCategoryIndex({ index: 0, category: categories[0] });
            setSortedCoffee([
                ...CoffeeList.filter((item: any) =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                ),
            ]);
        };
    };

    const resetSearchCoffee = () => {
        ListRef?.current?.scrollToOffset({
            animated: true,
            offset: 0,
        });
        setCategoryIndex({ index: 0, category: categories[0] });
        setSortedCoffee([...CoffeeList]);
        setSearchText('');
    }

    return <View style={styles.ScreenContainer}>
        <StatusBar backgroundColor={COLORS.primaryBlackHex} />
        <ScrollView
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ScrollViewFlex}>

            {/* App Header */}
            <HeaderBar />
            <Text style={styles.ScreenTitle}>
                Find the best{'\n'}coffee for you
            </Text>

            {/* Search Input */}
            <View style={styles.InputContainerComponent}>
                <TouchableOpacity
                    onPress={() => {
                        searchCoffee(searchText);
                    }}>
                    <CustomIcon
                        style={styles.InputIcon}
                        name='search'
                        size={FONTSIZE.size_18}
                        color={searchText.length > 0
                            ? COLORS.primaryOrangeHex
                            : COLORS.primaryLightGreyHex}
                    />
                </TouchableOpacity>
                <TextInput
                    placeholder='Find Your Coffee...'
                    value={searchText}
                    onChangeText={text => {
                        setSearchText(text);
                        searchCoffee(text);
                    }}
                    placeholderTextColor={COLORS.primaryLightGreyHex}
                    style={styles.TextInputContainer}
                />
                {searchText.length > 0 ? (
                    <TouchableOpacity
                        onPress={() => {
                            resetSearchCoffee();
                        }}>
                        <CustomIcon
                            style={styles.InputIcon}
                            name="close"
                            size={FONTSIZE.size_16}
                            color={COLORS.primaryLightGreyHex}
                        />
                    </TouchableOpacity>
                ) : (
                    <></>
                )}
            </View>

            {/* Category Scroller */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.CategoryScroolViewStyle}>
                {categories.map((data, index) => (
                    <View
                        key={index.toString()}
                        style={styles.CategoryScroolViewContainer}>
                        <TouchableOpacity
                            style={styles.CategoryScroolViewItem}
                            onPress={() => {
                                ListRef?.current?.scrollToOffset({
                                    animated: true,
                                    offset: 0,
                                });
                                setCategoryIndex({ index: index, category: categories[index] })
                                setSortedCoffee([
                                    ...getCoffeeList(categories[index], CoffeeList)
                                ]);
                            }}>
                            <Text style={[
                                styles.CategoryText,
                                categoryIndex.index == index
                                    ? { color: COLORS.primaryOrangeHex } : {},
                            ]}>
                                {data}
                            </Text>
                            {categoryIndex.index == index ? (
                                <View style={styles.ActiveCategory} />
                            ) : (
                                <></>
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Coffee Flatlist */}
            <FlatList
                ref={ListRef}
                horizontal
                ListEmptyComponent={
                    <View style={styles.EmthyListContainer}>
                        <Text style={styles.CategoryText}>No Coffee Available</Text>
                    </View>
                }
                showsHorizontalScrollIndicator={false}
                data={sortedCoffee}
                contentContainerStyle={styles.FlatListContainer}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                navigation.push('Details');
                            }}>
                            <CoffeeCard
                                id={item.id}
                                index={item.index}
                                type={item.type}
                                rosted={item.rosted}
                                imagelink_square={item.imagelink_square}
                                name={item.name}
                                special_ingredient={item.special_ingredient}
                                average_rating={item.average_rating}
                                price={item.prices[2]}
                                bottomPressHandler={() => { }}
                            />
                        </TouchableOpacity>
                    );
                }}
            />

            <Text style={styles.CoffeeBeansTitle}>Coffee Beans</Text>

            {/* Beans Flatlist */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={BeanList}
                contentContainerStyle={[
                    styles.FlatListContainer,
                    { marginBottom: tabBarHeight }]}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                navigation.push('Details');
                            }}>
                            <CoffeeCard
                                id={item.id}
                                index={item.index}
                                type={item.type}
                                rosted={item.rosted}
                                imagelink_square={item.imagelink_square}
                                name={item.name}
                                special_ingredient={item.special_ingredient}
                                average_rating={item.average_rating}
                                price={item.prices[2]}
                                bottomPressHandler={() => { }}
                            />
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Bean Flatlist */}
        </ScrollView>
    </View>
};

const styles = StyleSheet.create({
    ScreenContainer: {
        flex: 1,
        backgroundColor: COLORS.primaryBlackHex,
    },
    ScrollViewFlex: {
        flexGrow: 1,
    },
    ScreenTitle: {
        fontSize: FONTSIZE.size_20,
        fontFamily: FONTFAMILY.poppins_semibold,
        color: COLORS.primaryWhiteHex,
        paddingLeft: SPACING.space_30,
    },
    InputContainerComponent: {
        flexDirection: 'row',
        margin: SPACING.space_30,
        borderRadius: BORDERRADIUS.radius_20,
        backgroundColor: COLORS.primaryDarkGreyHex,
        alignItems: 'center',
    },
    InputIcon: {
        marginHorizontal: SPACING.space_20,
    },
    TextInputContainer: {
        flex: 1,
        height: SPACING.space_20 * 3,
        fontFamily: FONTFAMILY.poppins_medium,
        fontSize: FONTSIZE.size_14,
        color: COLORS.primaryWhiteHex,
    },
    CategoryScroolViewStyle: {
        paddingHorizontal: SPACING.space_20,
        marginBottom: SPACING.space_20
    },
    CategoryScroolViewContainer: {
        paddingHorizontal: SPACING.space_15,
    },
    CategoryScroolViewItem: {
        alignItems: 'center'
    },
    CategoryText: {
        fontFamily: FONTFAMILY.poppins_semibold,
        fontSize: FONTSIZE.size_16,
        color: COLORS.primaryLightGreyHex,
        marginBottom: SPACING.space_4,
    },
    ActiveCategory: {
        height: SPACING.space_10,
        width: SPACING.space_10,
        borderRadius: BORDERRADIUS.radius_10,
        backgroundColor: COLORS.primaryOrangeHex,
    },
    FlatListContainer: {
        gap: SPACING.space_20,
        paddingVertical: SPACING.space_20,
        paddingHorizontal: SPACING.space_30
    },
    EmthyListContainer: {
        width: Dimensions.get('window').width - SPACING.space_30 * 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.space_36 * 3.3
    },
    CoffeeBeansTitle: {
        fontSize: FONTSIZE.size_18,
        marginLeft: SPACING.space_30,
        marginTop: SPACING.space_20,
        fontFamily: FONTFAMILY.poppins_medium,
        color: COLORS.secondaryLightGreyHex,
    },
})

export default HomeScreen