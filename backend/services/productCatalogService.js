const fs = require('fs').promises;
const path = require('path');

class ProductCatalogService {
  constructor() {
    this.catalogPath = path.join(__dirname, '../data/product.json');
    this.catalog = null;
  }

  async loadCatalog() {
    if (this.catalog) return this.catalog;
    
    try {
      const data = await fs.readFile(this.catalogPath, 'utf8');
      this.catalog = JSON.parse(data);
      return this.catalog;
    } catch (error) {
      console.error('Error loading product catalog:', error);
      return [];
    }
  }

  async getAvailableProducts({ location, deliveryDate }) {
    const catalog = await this.loadCatalog();
    const eventDate = new Date(deliveryDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

    return catalog.filter(product => {
      // Check delivery time
      const canDeliver = product.shippingDays <= daysUntilEvent;
      
      // Check location availability
      const availableInLocation = !product.availableLocations || 
                                  product.availableLocations.includes(location) ||
                                  product.availableLocations.includes('all');

      return canDeliver && availableInLocation && product.inStock;
    });
  }

  async getProductById(productId) {
    const catalog = await this.loadCatalog();
    return catalog.find(p => p.id === productId);
  }
}

module.exports = new ProductCatalogService();