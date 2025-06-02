
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Truck, X } from 'lucide-react';

interface DistributeShipmentFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DistributeShipmentForm: React.FC<DistributeShipmentFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupDateTime: '',
    deliveryDateTime: '',
    transportConditions: '',
    temperatureRange: '',
    distributionCenter: '',
    distributionLineId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.distributeShipment(shipmentId, formData);
      toast({
        title: "Shipment distributed successfully",
        description: "The shipment is now in transit for delivery.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error distributing shipment",
        description: error instanceof Error ? error.message : "Failed to distribute shipment",
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
          <Truck className="h-5 w-5" />
          <span>Distribute Shipment</span>
        </CardTitle>
        <CardDescription>
          Enter distribution and transport details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupDateTime">Pickup Date & Time</Label>
              <Input
                id="pickupDateTime"
                type="datetime-local"
                value={formData.pickupDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupDateTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="deliveryDateTime">Delivery Date & Time</Label>
              <Input
                id="deliveryDateTime"
                type="datetime-local"
                value={formData.deliveryDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDateTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transportConditions">Transport Conditions</Label>
              <Input
                id="transportConditions"
                value={formData.transportConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, transportConditions: e.target.value }))}
                required
                placeholder="e.g., Refrigerated, Dry, Frozen"
              />
            </div>
            <div>
              <Label htmlFor="temperatureRange">Temperature Range</Label>
              <Input
                id="temperatureRange"
                value={formData.temperatureRange}
                onChange={(e) => setFormData(prev => ({ ...prev, temperatureRange: e.target.value }))}
                required
                placeholder="e.g., 2-8°C, Room Temperature"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distributionCenter">Distribution Center</Label>
              <Input
                id="distributionCenter"
                value={formData.distributionCenter}
                onChange={(e) => setFormData(prev => ({ ...prev, distributionCenter: e.target.value }))}
                required
                placeholder="e.g., Central Distribution Hub"
              />
            </div>
            <div>
              <Label htmlFor="distributionLineId">Vehicle/Line ID</Label>
              <Input
                id="distributionLineId"
                value={formData.distributionLineId}
                onChange={(e) => setFormData(prev => ({ ...prev, distributionLineId: e.target.value }))}
                required
                placeholder="e.g., TRUCK-001, ROUTE-ABC"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-yellow-600 hover:bg-yellow-700">
              {loading ? 'Distributing...' : 'Distribute Shipment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DistributeShipmentForm;
