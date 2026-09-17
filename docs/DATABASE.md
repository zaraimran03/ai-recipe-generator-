# Database Schema Documentation

This document describes the structure and relationships of the backend database models.

## User (`CustomUser`)

Extends Django's `AbstractUser` to provide custom authentication and profile details.

- **`id`**: UUID, Primary Key.
- **`username`**: String, Unique. Standard Django username field.
- **`name`**: String. The user's full name.
- **`email`**: String, Unique. Used as the primary login field.
- **`avatar`**: ImageField, nullable. Profile picture.
- **`diet_preference`**: String, nullable. Choices: `vegetarian`, `vegan`, `paleo`, `keto`, `gluten_free`, `none`.
- **`created_at`**: DateTime. Timestamp of account creation.
- **`updated_at`**: DateTime. Timestamp of last profile update.

## Recipe

Represents a recipe created by a user.

- **`id`**: UUID, Primary Key.
- **`user`**: ForeignKey -> `User`. The author of the recipe. (Deletes recipe if user is deleted).
- **`title`**: String. Name of the recipe.
- **`ingredients`**: JSONField. A list of objects containing ingredient details (e.g., `[{name: 'Sugar', quantity: 1, unit: 'cup'}]`).
- **`instructions`**: JSONField. An ordered list of instruction strings.
- **`nutrition`**: JSONField. Nutritional information as a dictionary (e.g., `{calories, protein, carbs, fat}`).
- **`servings`**: PositiveIntegerField. Number of servings the recipe yields.
- **`difficulty`**: String. Choices: `easy`, `medium`, `hard`.
- **`time`**: PositiveIntegerField. Time to prepare/cook in minutes.
- **`created_at`**: DateTime. Timestamp when the recipe was created.

**Indexes**:
- `(user, created_at)`: Optimized for fetching and ordering a specific user's recipes by creation date.

## Favorite

Stores a user's favorited recipes.

- **`id`**: UUID, Primary Key.
- **`user`**: ForeignKey -> `User`. The user who favorited the recipe.
- **`recipe`**: ForeignKey -> `Recipe`. The favorited recipe.
- **`created_at`**: DateTime. Timestamp of when the favorite was recorded.

**Constraints**:
- `unique_together = ('user', 'recipe')`: A user can favorite a specific recipe only once.

## History

Tracks the recipes generated or viewed by a user.

- **`id`**: UUID, Primary Key.
- **`user`**: ForeignKey -> `User`. The user whose history is being recorded.
- **`recipe`**: ForeignKey -> `Recipe`. The recipe associated with the history event.
- **`generated_at`**: DateTime. Timestamp of the history event.

## Relationships Summary

- **One-to-Many (`User` -> `Recipe`)**: One user can author many recipes.
- **Many-to-Many (`User` <-> `Recipe` via `Favorite`)**: A user can favorite many recipes, and a recipe can be favorited by many users.
- **Many-to-Many (`User` <-> `Recipe` via `History`)**: A user has many recipes in their history, and a recipe can appear in the history of many users.
