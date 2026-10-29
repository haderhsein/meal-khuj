import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BeatLoader from 'react-spinners/BeatLoader';
import Categories from '../../components/category/Categories';
import SearchBar from '../../components/mealsPage/SearchBar';
import SingleMealCard from '../../components/mealsPage/SingleMealCard';
import PointText from '../../components/text/PointText';
import Text from '../../components/text/Text';
import classes from './meals.module.scss';

const override = {
  display: 'inline-block',
  margin: '0 auto',
};

const getMeals = async ({ queryKey }) => {
  const { data } = await axios.get(`filter.php?c=${encodeURIComponent(queryKey[1])}`);
  return data?.meals || [];
};

const getQueriedMeals = async ({ queryKey }) => {
  const { data } = await axios.get(`search.php?s=${encodeURIComponent(queryKey[1])}`);
  return data?.meals || [];
};

const getCategories = async () => {
  const { data } = await axios.get('/categories.php');
  return data?.categories || [];
};

function Meals() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');

  const {
    data: categories = [],
    isLoading: categoryIsLoading,
    isError: categoryIsError,
    error: categoryError,
  } = useQuery(['categories'], getCategories);

  const {
    data: queriedData = [],
    isLoading: queryIsLoading,
    isError: queryIsError,
  } = useQuery(['mealsByQuery', query], getQueriedMeals, {
    enabled: query !== '',
  });

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery(['mealsByCategory', selectedCategory], getMeals, {
    enabled: query === '' && selectedCategory !== '',
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedSearch = searchText.trim();

      if (normalizedSearch) {
        setQuery(normalizedSearch);
        setSelectedCategory('');
      } else {
        setQuery('');
        if (categories.length > 0) {
          setSelectedCategory(categories[0].strCategory);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText, categories]);

  useEffect(() => {
    if (!searchText.trim() && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].strCategory);
    }
  }, [categories, searchText, selectedCategory]);

  const isLoadingMeals = query ? queryIsLoading : isLoading;
  const isErrorMeals = query ? queryIsError : isError;
  const visibleMeals = query ? queriedData : data;

  return (
    <div className={classes.meals__page}>
      <SearchBar searchText={searchText} setSearchText={setSearchText} />
      <PointText className={classes.text}>search meals or select categories from below.</PointText>

      <Categories
        setSelectedCategory={(category) => {
          setSelectedCategory(category);
          setSearchText('');
          setQuery('');
        }}
        selectedCategory={selectedCategory}
        categories={categories}
        categoryIsLoading={categoryIsLoading}
        categoryIsError={categoryIsError}
        categoryError={categoryError}
        setQuery={setQuery}
      />

      {(isLoadingMeals || categoryIsLoading) && (
        <div className={classes.loadingSpinner}>
          <BeatLoader color="#fff" loading={isLoadingMeals || categoryIsLoading} cssOverride={override} size={20} />
        </div>
      )}

      <div className={classes.meals__container}>
        {!isLoadingMeals && !isErrorMeals && visibleMeals.map((meal) => (
          <SingleMealCard key={meal.idMeal} meal={meal} />
        ))}
        {!isLoadingMeals && !isErrorMeals && !categoryIsLoading && visibleMeals.length === 0 && (
          <Text>No meals found</Text>
        )}
        {(isErrorMeals || categoryIsError) && (
          <Text>Unable to load meals right now. Please try again.</Text>
        )}
      </div>
    </div>
  );
}

export default Meals;
