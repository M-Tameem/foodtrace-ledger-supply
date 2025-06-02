import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  Truck,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import ProcessShipmentForm from '@/components/ProcessShipmentForm';
import DistributeShipmentForm from '@/components/DistributeShipmentForm';
import ReceiveShipmentForm from '@/components/ReceiveShipmentForm';
import RecordCertificationForm from '@/components/RecordCertificationForm';

const ShipmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadShipmentDetails();
    } else {
      setLoading(false);
      toast({
        title: "Invalid shipment ID",
        description: "Please provide a valid shipment ID",
        variant: "destructive",
      });
    }
  }, [id]);

  const loadShipmentDetails = async () => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    
    try {
      console.log('Getting shipment details for ID:', id);
      const data = await apiClient.getShipmentDetails(id);
      setShipment(data);
    } catch (error) {
      toast({
        title: "Error loading shipment",
        description: error instanceof Error ? error.message : "Failed to load shipment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForCertification = async () => {
    setActionLoading(true);
    try {
      await apiClient.submitForCertification(id!);
      toast({
        title: "Submitted for certification",
        description: "Shipment has been submitted for organic certification.",
      });
      loadShipmentDetails();
    } catch (error) {
      toast({
        title: "Error submitting for certification",
        description: error instanceof Error ? error.message : "Failed to submit",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <Package className="h-5 w-5" />;
      case 'PROCESSED': return <CheckCircle className="h-5 w-5" />;
      case 'DISTRIBUTED': return <Truck className="h-5 w-5" />;
      case 'DELIVERED': return <Building className="h-5 w-5" />;
      case 'RECALLED': return <AlertTriangle className="h-5 w-5" />;
      case 'PENDING_CERTIFICATION': return <Clock className="h-5 w-5" />;
      case 'CERTIFIED': return <ShieldCheck className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-green-100 text-green-800';
      case 'DISTRIBUTED': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800';
      case 'RECALLED': return 'bg-red-100 text-red-800';
      case 'PENDING_CERTIFICATION': return 'bg-orange-100 text-orange-800';
      case 'CERTIFIED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimelineSteps = () => {
    const steps = [
      { key: 'CREATED', label: 'Created', icon: Package },
      { key: 'CERTIFIED', label: 'Certified', icon: ShieldCheck },
      { key: 'PROCESSED', label: 'Processed', icon: CheckCircle },
      { key: 'DISTRIBUTED', label: 'Distributed', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: Building },
    ];

    const currentStatusIndex = steps.findIndex(step => step.key === shipment?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      current: step.key === shipment?.status
    }));
  };

  const canSubmitForCertification = () => {
    return user?.role === 'farmer' && 
           shipment?.status === 'CREATED' && 
           shipment?.currentOwnerAlias === user?.chaincode_alias;
  };

  const canProcess = () => {
    return user?.role === 'processor' && 
           shipment?.status === 'CERTIFIED' && 
           shipment?.currentOwnerAlias === user?.chaincode_alias;
  };

  const canDistribute = () => {
    return user?.role === 'distributor' && 
           shipment?.status === 'PROCESSED' && 
           shipment?.currentOwnerAlias === user?.chaincode_alias;
  };

  const canReceive = () => {
    return user?.role === 'retailer' && 
           shipment?.status === 'DISTRIBUTED' && 
           shipment?.currentOwnerAlias === user?.chaincode_alias;
  };

  const canCertify = () => {
    return user?.role === 'certifier' && 
           shipment?.status === 'PENDING_CERTIFICATION';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (!id || id === 'undefined' || !shipment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment not found</h2>
          <p className="text-gray-600 mb-4">The shipment you're looking for doesn't exist or the ID is invalid.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shipment.productName}</h1>
              <p className="text-gray-600">Shipment ID: {shipment.shipmentID}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className={`${getStatusColor(shipment.status)} flex items-center space-x-1`}>
              {getStatusIcon(shipment.status)}
              <span>{shipment.status.replace('_', ' ')}</span>
            </Badge>
            
            {/* Action buttons based on user role and shipment status */}
            {canSubmitForCertification() && (
              <Button
                onClick={handleSubmitForCertification}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading ? 'Submitting...' : 'Submit for Certification'}
              </Button>
            )}
            
            {canProcess() && (
              <Button
                onClick={() => setShowProcessForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Process Shipment
              </Button>
            )}
            
            {canDistribute() && (
              <Button
                onClick={() => setShowDistributeForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Distribute Shipment
              </Button>
            )}
            
            {canReceive() && (
              <Button
                onClick={() => setShowReceiveForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Receive Shipment
              </Button>
            )}
            
            {canCertify() && (
              <Button
                onClick={() => setShowCertificationForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Record Certification
              </Button>
            )}
          </div>
        </div>

        {/* Forms */}
        {showProcessForm && (
          <ProcessShipmentForm
            shipmentId={shipment.shipmentID}
            onSuccess={() => {
              setShowProcessForm(false);
              loadShipmentDetails();
            }}
            onCancel={() => setShowProcessForm(false)}
          />
        )}
        
        {showDistributeForm && (
          <DistributeShipmentForm
            shipmentId={shipment.shipmentID}
            onSuccess={() => {
              setShowDistributeForm(false);
              loadShipmentDetails();
            }}
            onCancel={() => setShowDistributeForm(false)}
          />
        )}
        
        {showReceiveForm && (
          <ReceiveShipmentForm
            shipmentId={shipment.shipmentID}
            onSuccess={() => {
              setShowReceiveForm(false);
              loadShipmentDetails();
            }}
            onCancel={() => setShowReceiveForm(false)}
          />
        )}
        
        {showCertificationForm && (
          <RecordCertificationForm
            shipmentId={shipment.shipmentID}
            onSuccess={() => {
              setShowCertificationForm(false);
              loadShipmentDetails();
            }}
            onCancel={() => setShowCertificationForm(false)}
          />
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Progress</CardTitle>
            <CardDescription>Track the shipment's journey through the supply chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getTimelineSteps().map((step, index) => (
                <div key={step.key} className="flex flex-col items-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? step.current 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < getTimelineSteps().length - 1 && (
                    <div className={`hidden md:block absolute w-full h-0.5 top-6 left-6 ${
                      step.completed ? 'bg-emerald-200' : 'bg-gray-200'
                    }`} style={{ width: 'calc(100% - 3rem)' }} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Product Name</label>
                <p className="text-gray-900">{shipment.productName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{shipment.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-gray-900">{shipment.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit</label>
                  <p className="text-gray-900">{shipment.unitOfMeasure}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Owner</label>
                <p className="text-gray-900">{shipment.currentOwnerAlias}</p>
              </div>
            </CardContent>
          </Card>

          {/* Farm Information */}
          {shipment.farmerData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Farm Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Farm Name</label>
                  <p className="text-gray-900">{shipment.farmerData.farmerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{shipment.farmerData.farmLocation}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Crop Type</label>
                    <p className="text-gray-900">{shipment.farmerData.cropType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Farming Practice</label>
                    <p className="text-gray-900">{shipment.farmerData.farmingPractice}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Planting Date</label>
                    <p className="text-gray-900">{formatDate(shipment.farmerData.plantingDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                    <p className="text-gray-900">{formatDate(shipment.farmerData.harvestDate)}</p>
                  </div>
                </div>
                {shipment.farmerData.fertilizerUsed && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fertilizer Used</label>
                    <p className="text-gray-900">{shipment.farmerData.fertilizerUsed}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Processing Information */}
        {shipment.processorData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Processing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Processing Type</label>
                <p className="text-gray-900">{shipment.processorData.processingType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Processing Line</label>
                <p className="text-gray-900">{shipment.processorData.processingLineId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date Processed</label>
                <p className="text-gray-900">{formatDate(shipment.processorData.dateProcessed)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contamination Check</label>
                <p className="text-gray-900">{shipment.processorData.contaminationCheck}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Batch ID</label>
                <p className="text-gray-900">{shipment.processorData.outputBatchId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                <p className="text-gray-900">{formatDate(shipment.processorData.expiryDate)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Distribution Information */}
        {shipment.distributorData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Distribution Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Pickup Date</label>
                <p className="text-gray-900">{formatDate(shipment.distributorData.pickupDateTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                <p className="text-gray-900">{formatDate(shipment.distributorData.deliveryDateTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Transport Conditions</label>
                <p className="text-gray-900">{shipment.distributorData.transportConditions}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Temperature Range</label>
                <p className="text-gray-900">{shipment.distributorData.temperatureRange}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Distribution Center</label>
                <p className="text-gray-900">{shipment.distributorData.distributionCenter}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vehicle ID</label>
                <p className="text-gray-900">{shipment.distributorData.distributionLineId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Retail Information */}
        {shipment.retailerData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Retail Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Store Name</label>
                <p className="text-gray-900">{shipment.retailerData.storeLocation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date Received</label>
                <p className="text-gray-900">{formatDate(shipment.retailerData.dateReceived)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Retail Price</label>
                <p className="text-gray-900">${shipment.retailerData.price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sell By Date</label>
                <p className="text-gray-900">{formatDate(shipment.retailerData.sellByDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Shelf Life</label>
                <p className="text-gray-900">{shipment.retailerData.shelfLife}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Store ID</label>
                <p className="text-gray-900">{shipment.retailerData.storeId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certification Records */}
        {shipment.certificationRecords && shipment.certificationRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Certification Records</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipment.certificationRecords.map((cert: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Inspection Date</label>
                        <p className="text-gray-900">{formatDate(cert.inspectionDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Badge className={cert.certificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {cert.certificationStatus}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Certifier</label>
                        <p className="text-gray-900">{cert.certifierIdentity}</p>
                      </div>
                    </div>
                    {cert.comments && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-500">Comments</label>
                        <p className="text-gray-900">{cert.comments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ShipmentDetails;
