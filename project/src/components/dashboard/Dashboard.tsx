import React, { useEffect, useState } from 'react';
import { 
  FileText, Shield, Database, Lock,
  Building2, MapPin, CheckCircle, Link as LinkIcon
} from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';
import { useApplications } from '../../hooks/useApplications';
import { BlockchainService } from '../../blockchain/services/BlockchainService';
import { ApplicationStatus } from '../../types/application';

interface DocumentHash {
  documentId: string;
  hash: string;
  timestamp: string;
  blockNumber: number;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { businessInfo, loading: bizLoading } = useBusinessInfo();
  const { applications, loading: appLoading } = useApplications();
  const [blockchainStatus, setBlockchainStatus] = useState({ blocks: 0, isValid: false });
  const [loading, setLoading] = useState(true);
  const [documentHashes, setDocumentHashes] = useState<DocumentHash[]>([]);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const blockchain = BlockchainService.getInstance();
        const status = await blockchain.getChainStatus();
        setBlockchainStatus(status);

        // Get document hashes from blockchain
        if (applications.length > 0) {
          const promises = applications.flatMap(app => 
            Array.isArray(app.documents) ? app.documents.map(async doc => ({
              documentId: doc,
              hash: await blockchain.getDocumentHash(doc) || '',
              timestamp: new Date().toISOString(),
              blockNumber: status.blocks
            })) : []
          );
          const hashes = await Promise.all(promises);
          setDocumentHashes(hashes);
        }
      } catch (error) {
        console.error('Dashboard initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [applications]);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED:
        return 'text-green-600';
      case ApplicationStatus.REJECTED:
        return 'text-red-600';
      default:
        return 'text-orange-600';
    }
  };

  if (loading || bizLoading || appLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Welcome Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                नमस्ते / Welcome, {user?.email?.split('@')[0]}
              </h1>
              <div className="space-y-2">
                <p className="text-orange-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Blockchain ID: {user?.id?.slice(0, 8)}...
                </p>
                <p className="text-orange-100 flex items-center text-sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Documents secured by blockchain technology
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <Database className="w-6 h-6 mb-1" />
                <p className="text-sm">Blockchain Status</p>
                <p className="text-xs text-orange-200">
                  Blocks: {blockchainStatus.blocks}
                </p>
                <p className="text-xs text-orange-200 flex items-center justify-end">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {blockchainStatus.isValid ? 'Chain Verified' : 'Verification Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Documents Secured
            </h3>
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-2xl font-bold">
                {documentHashes.length}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Blockchain Verifications
            </h3>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                {blockchainStatus.blocks}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Security Level
            </h3>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">Military Grade</span>
            </div>
          </div>
        </div>

        {/* Applications with Blockchain Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Applications</h2>
              <div className="flex items-center text-sm text-gray-600">
                <Database className="w-4 h-4 mr-1" />
                Blockchain Secured
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {applications.map(app => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{app.service_id}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Block ID: {app.id.slice(0, 8)}...
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Documents secured with SHA-256 encryption
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${getStatusColor(app.status)}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Show document hashes */}
                  <div className="mt-3 text-xs font-mono bg-gray-50 p-3 rounded">
                    {documentHashes
                        .filter(hash => Array.isArray(app.documents) && app.documents.includes(hash.documentId))
                      .map(hash => (
                        <div key={hash.hash} className="flex items-center text-gray-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Hash: {hash.hash.slice(0, 16)}...
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {businessInfo.map(biz => (
                <div key={biz.id} className="p-6">
                  <h3 className="font-medium text-lg">{biz.trade_name}</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      PAN: {biz.pan}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      Type: {biz.business_type}
                    </p>
                    <p className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {biz.state}, {biz.district}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;