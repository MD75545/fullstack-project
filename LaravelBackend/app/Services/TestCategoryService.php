<?php

namespace App\Services;

use App\Repositories\TestCategoryRepository;
use Exception;

class TestCategoryService
{
    protected TestCategoryRepository $testCategoryRepository;

    public function __construct(TestCategoryRepository $testCategoryRepository)
    {
        $this->testCategoryRepository = $testCategoryRepository;
    }

    public function createCategory(array $categoryData): array
    {
        try {
            $createdData = $this->testCategoryRepository->createCategory($categoryData);
            $category = $this->testCategoryRepository->getCategoryById($createdData['test_category_id']);

            return [
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Category creation failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function updateCategory(int $categoryId, array $categoryData): array
    {
        try {
            $updatedData = $this->testCategoryRepository->updateCategory($categoryId, $categoryData);
            $category = $this->testCategoryRepository->getCategoryById($categoryId);

            return [
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Category update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function getAllCategories(): array
    {
        try {
            $categories = $this->testCategoryRepository->getAllCategories();

            return [
                'success' => true,
                'message' => 'Categories retrieved successfully',
                'data' => $categories,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve categories: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getCategory(int $categoryId): array
    {
        try {
            $category = $this->testCategoryRepository->getCategoryById($categoryId);

            if (!$category) {
                return [
                    'success' => false,
                    'message' => 'Category not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Category retrieved successfully',
                'data' => $category,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve category: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function deleteCategory(int $categoryId): array
    {
        try {
            $deleted = $this->testCategoryRepository->deleteCategory($categoryId);

            return [
                'success' => true,
                'message' => 'Category deleted successfully',
                'data' => null,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete category: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'not found')) {
            return 404;
        }

        if (str_contains($e->getMessage(), 'already exists') || str_contains($e->getMessage(), 'Duplicate entry')) {
            return 422;
        }

        return 500;
    }
}