
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X } from 'lucide-react';

interface ProcessShipmentFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProcessShipmentForm: React.FC<ProcessShipmentFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    processingType: '',
    processingLineId: '',
    dateProcessed: '',
    contaminationCheck: '',
    outputBatchId: '',
    expiryDate: '',
    processingLocation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.processShipment(shipmentId, formData);
      toast({
        title: "Shipment processed successfully",
        description: "The shipment has been processed and is ready for distribution.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error processing shipment",
        description: error instanceof Error ? error.message : "Failed to process shipment",
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
          <CheckCircle className="h-5 w-5" />
          <span>Process Shipment</span>
        </CardTitle>
        <CardDescription>
          Enter processing details for this shipment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="processingType">Processing Type</Label>
              <Input
                id="processingType"
                value={formData.processingType}
                onChange={(e) => setFormData(prev => ({ ...prev, processingType: e.target.value }))}
                required
                placeholder="e.g., Washing, Packaging"
              />
            </div>
            <div>
              <Label htmlFor="processingLineId">Processing Line ID</Label>
              <Input
                id="processingLineId"
                value={formData.processingLineId}
                onChange={(e) => setFormData(prev => ({ ...prev, processingLineId: e.target.value }))}
                required
                placeholder="e.g., LINE-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateProcessed">Date Processed</Label>
              <Input
                id="dateProcessed"
                type="datetime-local"
                value={formData.dateProcessed}
                onChange={(e) => setFormData(prev => ({ ...prev, dateProcessed: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="contaminationCheck">Contamination Check</Label>
              <Select value={formData.contaminationCheck} onValueChange={(value) => setFormData(prev => ({ ...prev, contaminationCheck: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outputBatchId">Output Batch ID</Label>
              <Input
                id="outputBatchId"
                value={formData.outputBatchId}
                onChange={(e) => setFormData(prev => ({ ...prev, outputBatchId: e.target.value }))}
                required
                placeholder="e.g., BATCH-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="processingLocation">Processing Location</Label>
            <Input
              id="processingLocation"
              value={formData.processingLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, processingLocation: e.target.value }))}
              required
              placeholder="e.g., Processing Plant A, City, State"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Processing...' : 'Process Shipment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProcessShipmentForm;
