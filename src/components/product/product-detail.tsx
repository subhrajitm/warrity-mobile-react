import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProduct } from '@/contexts/product-context';
import { useService } from '@/contexts/service-context';
import { useWarranty } from '@/contexts/warranty-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ShoppingCartIcon, ShieldIcon, InfoIcon, TagIcon, BuildingIcon } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductDetailProps {
  productId: string;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { getProductById, isLoading: isProductLoading, error: productError } = useProduct();
  const { fetchProductServiceInfo, productServiceInfo, isLoading: isServiceLoading, error: serviceError } = useService();
  
  const [product, setProduct] = useState<Product | null>(null);
  
  // Fetch product details when component mounts
  useEffect(() => {
    const loadProductDetails = async () => {
      const productData = await getProductById(productId);
      if (productData) {
        setProduct(productData);
        // Fetch service info for this product
        fetchProductServiceInfo(productId);
      }
    };
    
    loadProductDetails();
  }, [productId]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (productError) {
      toast({
        title: 'Error',
        description: productError,
        variant: 'destructive',
      });
    }
    
    if (serviceError) {
      toast({
        title: 'Error',
        description: serviceError,
        variant: 'destructive',
      });
    }
  }, [productError, serviceError, toast]);
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  if (isProductLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Not Found</CardTitle>
          <CardDescription>
            The product you're looking for could not be found.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground text-lg">No image available</span>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{product.category}</Badge>
              <span className="text-muted-foreground">by {product.manufacturer}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold">{formatPrice(product.price)}</div>
            {product.discountPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <Badge variant="destructive">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </Badge>
              </div>
            )}
          </div>
          
          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
          
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Key Features</h2>
              <ul className="list-disc list-inside space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-muted-foreground">{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-8">
            <Button className="flex-1">
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Link href={`/warranties/new?productId=${product._id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <ShieldIcon className="mr-2 h-4 w-4" />
                Register Warranty
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="specifications" className="w-full mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="warranty">Warranty & Service</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(product.specifications).map(([category, specs]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-4">{category}</h3>
                      <div className="space-y-2">
                        {Object.entries(specs as Record<string, string>).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b">
                            <div className="font-medium">{key}</div>
                            <div>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No specifications available for this product.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warranty">
          <Card>
            <CardHeader>
              <CardTitle>Warranty & Service Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isServiceLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : productServiceInfo ? (
                <div className="space-y-8">
                  {productServiceInfo.warrantyTerms && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Warranty Terms</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="font-medium mb-2">Duration</div>
                            <div>{productServiceInfo.warrantyTerms.duration}</div>
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="font-medium mb-2">Coverage</div>
                            <div>{productServiceInfo.warrantyTerms.coverage}</div>
                          </div>
                        </div>
                        
                        {productServiceInfo.warrantyTerms.conditions.length > 0 && (
                          <div>
                            <div className="font-medium mb-2">Conditions</div>
                            <ul className="list-disc list-inside space-y-1">
                              {productServiceInfo.warrantyTerms.conditions.map((condition, index) => (
                                <li key={index}>{condition}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {productServiceInfo.contactInformation && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="font-medium mb-2">Customer Service</div>
                          <div>{productServiceInfo.contactInformation.customerService}</div>
                        </div>
                        
                        {productServiceInfo.contactInformation.technicalSupport && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="font-medium mb-2">Technical Support</div>
                            <div>{productServiceInfo.contactInformation.technicalSupport}</div>
                          </div>
                        )}
                        
                        <div className="p-4 bg-muted rounded-lg md:col-span-2">
                          <div className="font-medium mb-2">Website</div>
                          <a 
                            href={productServiceInfo.contactInformation.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {productServiceInfo.contactInformation.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {productServiceInfo.serviceCenters && productServiceInfo.serviceCenters.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Service Centers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {productServiceInfo.serviceCenters.map((center, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{center.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div>
                                <span className="font-medium">Address:</span> {center.address}
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span> {center.phone}
                              </div>
                              {center.email && (
                                <div>
                                  <span className="font-medium">Email:</span> {center.email}
                                </div>
                              )}
                              {center.hours && (
                                <div>
                                  <span className="font-medium">Hours:</span> {center.hours}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-6">
                    <Link href={`/warranties/new?productId=${product._id}`}>
                      <Button>
                        <ShieldIcon className="mr-2 h-4 w-4" />
                        Register Your Warranty
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No warranty or service information available for this product.</p>
                  <div className="mt-6">
                    <Link href={`/warranties/new?productId=${product._id}`}>
                      <Button variant="outline">
                        Register Your Warranty Manually
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No reviews available for this product yet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct._id} className="h-full flex flex-col">
                <div className="aspect-square relative bg-muted">
                  {relatedProduct.imageUrl ? (
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{relatedProduct.name}</CardTitle>
                  <CardDescription>
                    {relatedProduct.manufacturer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <p className="font-bold text-lg">
                    {formatPrice(relatedProduct.price)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/products/${relatedProduct._id}`} className="w-full">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
