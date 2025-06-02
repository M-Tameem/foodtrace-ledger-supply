
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, X } from 'lucide-react';

interface RecordCertificationFormProps {
  shipmentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const RecordCertificationForm: React.FC<RecordCertificationFormProps> = ({
  shipmentId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspectionDate: '',
    certificationStatus: '',
    comments: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.recordCertification(shipmentId, formData);
      toast({
        title: "Certification recorded successfully",
        description: `The shipment has been ${formData.certificationStatus.toLowerCase()}.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Error recording certification",
        description: error instanceof Error ? error.message : "Failed to record certification",
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
          <ShieldCheck className="h-5 w-5" />
          <span>Record Certification</span>
        </CardTitle>
        <CardDescription>
          Record the certification inspection results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspectionDate">Inspection Date</Label>
              <Input
                id="inspectionDate"
                type="datetime-local"
                value={formData.inspectionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="certificationStatus">Certification Status</Label>
              <Select value={formData.certificationStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, certificationStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CONDITIONAL">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Enter inspection notes, conditions, or reasons for rejection..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Recording...' : 'Record Certification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecordCertificationForm;
