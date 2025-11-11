<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class TestCategoryRepository
{
    public function createCategory(array $categoryData): array
    {
        try {
            DB::beginTransaction();

            $categoryId = DB::table('test_categories')->insertGetId([
                'name' => $categoryData['name']
            ]);

            if (!$categoryId) {
                throw new Exception('Failed to create category');
            }

            DB::commit();

            return [
                'test_category_id' => $categoryId,
                'category_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            
            // Check if it's a duplicate entry error
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                throw new Exception('Category name already exists');
            }
            
            throw $e;
        }
    }

    public function updateCategory(int $categoryId, array $categoryData): array
    {
        try {
            DB::beginTransaction();

            $category = DB::table('test_categories')->where('test_category_id', $categoryId)->first();
            if (!$category) {
                throw new Exception('Category not found');
            }

            $updated = DB::table('test_categories')
                ->where('test_category_id', $categoryId)
                ->update([
                    'name' => $categoryData['name']
                ]);

            if (!$updated) {
                throw new Exception('Failed to update category');
            }

            DB::commit();

            return [
                'test_category_id' => $categoryId,
                'category_updated' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            
            // Check if it's a duplicate entry error
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                throw new Exception('Category name already exists');
            }
            
            throw $e;
        }
    }

    public function getAllCategories()
    {
        return DB::table('test_categories')
            ->select('test_category_id', 'name')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getCategoryById(int $categoryId): ?object
    {
        return DB::table('test_categories')
            ->where('test_category_id', $categoryId)
            ->first();
    }

    public function deleteCategory(int $categoryId): bool
    {
        try {
            DB::beginTransaction();

            // Check if category exists
            $category = DB::table('test_categories')->where('test_category_id', $categoryId)->first();
            if (!$category) {
                throw new Exception('Category not found');
            }

            // Check if category is being used in tests (optional - add this check if you have a tests table)
            // $testsCount = DB::table('tests')->where('test_category_id', $categoryId)->count();
            // if ($testsCount > 0) {
            //     throw new Exception('Cannot delete category. It is being used by ' . $testsCount . ' test(s).');
            // }

            $deleted = DB::table('test_categories')->where('test_category_id', $categoryId)->delete();

            if (!$deleted) {
                throw new Exception('Failed to delete category');
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function checkCategoryExists(string $name): bool
    {
        return DB::table('test_categories')->where('name', $name)->exists();
    }
}