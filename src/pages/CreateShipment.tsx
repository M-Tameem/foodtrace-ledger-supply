
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package } from 'lucide-react';

const CreateShipment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipmentId: '',
    productName: '',
    description: '',
    quantity: '',
    unitOfMeasure: 'kg',
    farmerName: '',
    farmLocation: '',
    cropType: '',
    plantingDate: '',
    harvestDate: '',
    fertilizerUsed: '',
    farmingPractice: 'Conventional',
    destinationProcessorId: '',
    certificationDocumentHash: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateShipmentId = () => {
    const prefix = 'SHIP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shipmentId = formData.shipmentId || generateShipmentId();
      
      const farmerData = {
        farmerName: formData.farmerName,
        farmLocation: formData.farmLocation,
        cropType: formData.cropType,
        plantingDate: formData.plantingDate ? new Date(formData.plantingDate).toISOString() : '',
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate).toISOString() : '',
        fertilizerUsed: formData.fertilizerUsed,
        farmingPractice: formData.farmingPractice,
        destinationProcessorId: formData.destinationProcessorId,
        certificationDocumentHash: formData.certificationDocumentHash
      };

      await apiClient.createShipment({
        shipmentId,
        productName: formData.productName,
        description: formData.description,
        quantity: parseFloat(formData.quantity),
        unitOfMeasure: formData.unitOfMeasure,
        farmerData
      });

      toast({
        title: "Shipment created successfully",
        description: `Shipment ${shipmentId} has been created and recorded on the blockchain.`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error creating shipment",
        description: error instanceof Error ? error.message : "Failed to create shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core details about your shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipmentId">Shipment ID (Optional)</Label>
                  <Input
                    id="shipmentId"
                    value={formData.shipmentId}
                    onChange={(e) => handleInputChange('shipmentId', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required
                    placeholder="e.g., Organic Tomatoes"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the product"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select value={formData.unitOfMeasure} onValueChange={(value) => handleInputChange('unitOfMeasure', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm Details */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>
                Information about the farm and farming practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmerName">Farmer/Farm Name *</Label>
                  <Input
                    id="farmerName"
                    value={formData.farmerName}
                    onChange={(e) => handleInputChange('farmerName', e.target.value)}
                    required
                    placeholder="Farm name or farmer name"
                  />
                </div>
                <div>
                  <Label htmlFor="farmLocation">Farm Location *</Label>
                  <Input
                    id="farmLocation"
                    value={formData.farmLocation}
                    onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                    required
                    placeholder="City, State/Province, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Input
                    id="cropType"
                    value={formData.cropType}
                    onChange={(e) => handleInputChange('cropType', e.target.value)}
                    placeholder="e.g., Tomatoes, Wheat, Apples"
                  />
                </div>
                <div>
                  <Label htmlFor="farmingPractice">Farming Practice</Label>
                  <Select value={formData.farmingPractice} onValueChange={(value) => handleInputChange('farmingPractice', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organic">Organic</SelectItem>
                      <SelectItem value="Conventional">Conventional</SelectItem>
                      <SelectItem value="Sustainable">Sustainable</SelectItem>
                      <SelectItem value="Hydroponic">Hydroponic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plantingDate">Planting Date</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fertilizerUsed">Fertilizer/Nutrients Used</Label>
                <Textarea
                  id="fertilizerUsed"
                  value={formData.fertilizerUsed}
                  onChange={(e) => handleInputChange('fertilizerUsed', e.target.value)}
                  placeholder="List fertilizers, nutrients, or treatments used"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Destination & Certification */}
          <Card>
            <CardHeader>
              <CardTitle>Destination & Certification</CardTitle>
              <CardDescription>
                Processing destination and certification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="destinationProcessorId">Destination Processor ID</Label>
                <Input
                  id="destinationProcessorId"
                  value={formData.destinationProcessorId}
                  onChange={(e) => handleInputChange('destinationProcessorId', e.target.value)}
                  placeholder="ID of the processor who will receive this shipment"
                />
              </div>

              <div>
                <Label htmlFor="certificationDocumentHash">Certification Document Hash</Label>
                <Input
                  id="certificationDocumentHash"
                  value={formData.certificationDocumentHash}
                  onChange={(e) => handleInputChange('certificationDocumentHash', e.target.value)}
                  placeholder="Hash of any certification documents"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateShipment;
