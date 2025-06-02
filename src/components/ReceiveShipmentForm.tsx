
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Building, X } from 'lucide-react';

interface ReceiveShipmentFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReceiveShipmentForm: React.FC<ReceiveShipmentFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeLocation: '',
    dateReceived: '',
    price: '',
    sellByDate: '',
    shelfLife: '',
    storeId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.receiveShipment(shipmentId, formData);
      toast({
        title: "Shipment received successfully",
        description: "The shipment has been received and is available in store.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error receiving shipment",
        description: error instanceof Error ? error.message : "Failed to receive shipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Receive Shipment</span>
        </CardTitle>
        <CardDescription>
          Enter retail information for the received shipment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeLocation">Store Location</Label>
              <Input
                id="storeLocation"
                value={formData.storeLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, storeLocation: e.target.value }))}
                required
                placeholder="e.g., Main Street Store, City, State"
              />
            </div>
            <div>
              <Label htmlFor="storeId">Store ID</Label>
              <Input
                id="storeId"
                value={formData.storeId}
                onChange={(e) => setFormData(prev => ({ ...prev, storeId: e.target.value }))}
                required
                placeholder="e.g., STORE-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateReceived">Date Received</Label>
              <Input
                id="dateReceived"
                type="datetime-local"
                value={formData.dateReceived}
                onChange={(e) => setFormData(prev => ({ ...prev, dateReceived: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Retail Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                placeholder="e.g., 12.99"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sellByDate">Sell By Date</Label>
              <Input
                id="sellByDate"
                type="date"
                value={formData.sellByDate}
                onChange={(e) => setFormData(prev => ({ ...prev, sellByDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="shelfLife">Shelf Life</Label>
              <Input
                id="shelfLife"
                value={formData.shelfLife}
                onChange={(e) => setFormData(prev => ({ ...prev, shelfLife: e.target.value }))}
                required
                placeholder="e.g., 7 days, 2 weeks"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? 'Receiving...' : 'Receive Shipment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiveShipmentForm;
