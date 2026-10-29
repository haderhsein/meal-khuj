import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import PointText from '../components/text/PointText';
import Text from '../components/text/Text';
import Title from '../components/text/Title';
import { getSingleMeal } from './meals/[id]';
import classes from './savedMeals.module.scss';

function readSavedMealIds() {
  try {
    const storedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
    return Array.isArray(storedMeals)
      ? [...new Set(storedMeals.filter((id) => typeof id === 'string' || typeof id === 'number').map(String))]
      : [];
  } catch {
    return [];
  }
}

function SavedMeals() {
  const [savedMealsId, setSavedMealsId] = useState([]);

  const result = useQueries({
    queries: savedMealsId.map((id) => ({
      queryKey: ['singleMeal', id],
      queryFn: getSingleMeal,
    })),
  });

  useEffect(() => {
    setSavedMealsId(readSavedMealIds());
  }, []);

  const isLoading = result.some((mealQuery) => mealQuery.isLoading);
  const hasError = result.some((mealQuery) => mealQuery.isError);
  const savedMeals = result.map((mealQuery) => mealQuery.data).filter(Boolean);

  return (
    <div className={classes.pageWrapper}>
      <Title variant="primary" className={classes.pageTitle}>My Saved Meal List</Title>
      <div className={classes.list_container}>
        {savedMealsId.length === 0 && <Text>You have no saved meals</Text>}
        {savedMealsId.length > 0 && isLoading && <BeatLoader color="#fff" size={20} />}
        {savedMeals.map((meal) => (
          <Link href={`/meals/${meal.idMeal}`} key={meal.idMeal}>
            <a className={classes.singleMeal}>
              <Title variant="secondary" className={classes.mealTitle}>{meal.strMeal}</Title>
              <PointText>
                Category: {meal.strCategory}
              </PointText>
              <PointText>
                Area: {meal.strArea}
              </PointText>
            </a>
          </Link>
        ))}
        {savedMealsId.length > 0 && !isLoading && savedMeals.length === 0 && (
          <Text>Could not load your saved meals. Please try again later.</Text>
        )}
        {hasError && savedMeals.length > 0 && (
          <Text>Some saved meals could not be loaded.</Text>
        )}
      </div>
    </div>
  );
}

export default SavedMeals;
