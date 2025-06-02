
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/services/api';
import { 
  Package, 
  TruckIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Plus,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    created: 0,
    processed: 0,
    distributed: 0,
    delivered: 0,
    recalled: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.getMyShipments(20);
      const shipmentList = response.shipments || [];
      setShipments(shipmentList);
      
      // Calculate stats
      const newStats = {
        total: shipmentList.length,
        created: shipmentList.filter((s: any) => s.status === 'CREATED').length,
        processed: shipmentList.filter((s: any) => s.status === 'PROCESSED').length,
        distributed: shipmentList.filter((s: any) => s.status === 'DISTRIBUTED').length,
        delivered: shipmentList.filter((s: any) => s.status === 'DELIVERED').length,
        recalled: shipmentList.filter((s: any) => s.status === 'RECALLED').length,
      };
      setStats(newStats);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <Package className="h-4 w-4" />;
      case 'PROCESSED': return <CheckCircle className="h-4 w-4" />;
      case 'DISTRIBUTED': return <TruckIcon className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'RECALLED': return <AlertTriangle className="h-4 w-4" />;
      case 'PENDING_CERTIFICATION': return <Clock className="h-4 w-4" />;
      case 'CERTIFIED': return <ShieldCheck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
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

  const getRoleSpecificActions = () => {
    switch (user?.role) {
      case 'farmer':
        return (
          <div className="flex space-x-4">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link to="/shipments/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Shipment
              </Link>
            </Button>
          </div>
        );
      default:
        return null;
    }
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.chaincode_alias}
            </h1>
            <p className="text-gray-600 mt-1 capitalize">
              {user?.role} Dashboard
            </p>
          </div>
          {getRoleSpecificActions()}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.created + stats.processed + stats.distributed}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TruckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recalls</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recalled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Shipments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
            <CardDescription>
              Your latest shipment activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No shipments found</p>
                {user?.role === 'farmer' && (
                  <Button asChild className="mt-4">
                    <Link to="/shipments/new">Create your first shipment</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {shipments.slice(0, 5).map((shipment) => (
                  <div
                    key={shipment.shipmentID}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(shipment.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {shipment.productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {shipment.shipmentID}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/shipments/${shipment.shipmentID}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {shipments.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                      And {shipments.length - 5} more shipments...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
