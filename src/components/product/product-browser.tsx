import React, { useState, useEffect } from 'react';
import { useProduct } from '@/contexts/product-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Create simple pagination and spinner components
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};

const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }[size];
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-black ${sizeClass}`}></div>
  );
};
import { SearchIcon, FilterIcon, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

const sortOptions = [
  { value: 'nameAsc', label: 'Name (A-Z)' },
  { value: 'nameDesc', label: 'Name (Z-A)' },
  { value: 'priceAsc', label: 'Price (Low to High)' },
  { value: 'priceDesc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
];

const ProductBrowser = () => {
  const { 
    products, 
    categories, 
    isLoading, 
    error, 
    totalProducts, 
    totalPages, 
    currentPage,
    fetchProducts, 
    fetchCategories 
  } = useProduct();
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all-categories');
  const [selectedManufacturer, setSelectedManufacturer] = useState('all-manufacturers');
  const [sortOption, setSortOption] = useState('nameAsc');
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Only pass the filters if they're not the 'all' options
    const manufacturerFilter = selectedManufacturer === 'all-manufacturers' ? '' : selectedManufacturer;
    const categoryFilter = selectedCategory === 'all-categories' ? '' : selectedCategory;
    fetchProducts(1, 10, searchTerm, categoryFilter, manufacturerFilter, sortOption);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    // Only pass the filters if they're not the 'all' options
    const manufacturerFilter = selectedManufacturer === 'all-manufacturers' ? '' : selectedManufacturer;
    const categoryFilter = selectedCategory === 'all-categories' ? '' : selectedCategory;
    fetchProducts(page, 10, searchTerm, categoryFilter, manufacturerFilter, sortOption);
  };
  
  // Handle filter change
  const handleFilterChange = () => {
    // Only pass the filters if they're not the 'all' options
    const manufacturerFilter = selectedManufacturer === 'all-manufacturers' ? '' : selectedManufacturer;
    const categoryFilter = selectedCategory === 'all-categories' ? '' : selectedCategory;
    fetchProducts(1, 10, searchTerm, categoryFilter, manufacturerFilter, sortOption);
  };
  
  // Extract unique manufacturers from products
  useEffect(() => {
    if (products.length > 0) {
      // Filter out any null, undefined or empty string values
      const uniqueManufacturers = Array.from(
        new Set(
          products
            .map(product => product.brand)
            .filter((brand): brand is string => !!brand && brand.trim() !== '')
        )
      );
      setManufacturers(uniqueManufacturers);
    }
  }, [products]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Fetch products and categories when component mounts
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Products</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find products by name, category, or manufacturer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedManufacturer}
                onValueChange={(value) => {
                  setSelectedManufacturer(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Manufacturers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-manufacturers">All Manufacturers</SelectItem>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={sortOption}
                onValueChange={(value) => {
                  setSortOption(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all-categories');
            setSelectedManufacturer('all-manufacturers');
            setSortOption('nameAsc');
            fetchProducts();
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  return (
    <Card className="h-full flex flex-col">
      <div className="aspect-square relative bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>
          {product.brand} • {product.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {/* Display price if available, otherwise show a placeholder */}
        <p className="font-bold text-lg">
          {(product as any).price ? formatPrice((product as any).price) : 'Price not available'}
        </p>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {product.description}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/products/${product._id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductBrowser;
