import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetProfileQuery, useUpdateProfileMutation, useAddAddressMutation, useDeleteAddressMutation } from '../slices/authApiSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaUser, FaHome, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // States for Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Fetch full details
  const { data, isLoading, refetch } = useGetProfileQuery(undefined, { skip: !userInfo });
  const profile = data?.user;

  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress({
        street, city, state, zipCode: zip, country, phone, isDefault
      }).unwrap();
      toast.success('New delivery address saved!');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setPhone('');
      setIsDefault(false);
      setShowAddressForm(false);
      refetch();
    } catch (err) {
      toast.error('Could not save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId).unwrap();
      toast.success('Address deleted');
      refetch();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (isLoading) return <Loader text="Buffing profile details..." />;

  return (
    <div className="container fade-in profile-layout-grid">
      
      {/* Left Column: Account details */}
      <div style={{
        background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', height: 'fit-content'
      }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUser /> Account Details
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
          <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Full Name</span>
            <span style={{ fontWeight: 600 }}>{profile?.name}</span>
          </p>
          <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Email Address</span>
            <span style={{ fontWeight: 600 }}>{profile?.email}</span>
          </p>
          <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Phone Number</span>
            <span style={{ fontWeight: 600 }}>{profile?.phone || 'Not provided'}</span>
          </p>
          <p style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Account Role</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', fontSize: '0.78rem' }}>{profile?.role}</span>
          </p>
        </div>
      </div>

      {/* Right Column: Address Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Addresses Box */}
        <div style={{
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FaHome /> Delivery Addresses
            </h3>
            {!showAddressForm && (
              <button 
                onClick={() => setShowAddressForm(true)}
                className="btn btn-outline"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPlus size={10} /> Add New
              </button>
            )}
          </div>

          {/* Form inline */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} style={{
              background: 'var(--bg-color)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '20px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary-color)' }}>New Address</h4>
              
              <input 
                type="text" placeholder="Street Address / Area"
                value={street} onChange={(e) => setStreet(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input 
                  type="text" placeholder="City"
                  value={city} onChange={(e) => setCity(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                />
                <input 
                  type="text" placeholder="State"
                  value={state} onChange={(e) => setState(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input 
                  type="text" placeholder="ZIP Code / Pin"
                  value={zip} onChange={(e) => setZip(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                />
                <input 
                  type="tel" placeholder="Phone at delivery"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ accentColor: 'var(--primary-color)' }}
                />
                Set as Default Delivery Address
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button type="submit" disabled={isAddingAddress} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Save Address
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddressForm(false)}
                  className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of existing saved addresses */}
          {!profile?.addresses || profile.addresses.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No saved addresses found. Add one to checkout swiftly.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.addresses.map((addr) => (
                <div key={addr._id} style={{
                  border: addr.isDefault ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                  borderRadius: '10px', padding: '16px', position: 'relative', background: addr.isDefault ? '#FFF9FB' : 'transparent'
                }}>
                  {addr.isDefault && (
                    <span style={{
                      position: 'absolute', top: '16px', right: '16px', background: 'var(--primary-color)', color: 'white',
                      fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600
                    }}>
                      <FaCheck size={8} /> Default
                    </span>
                  )}
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{addr.street}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {addr.city}, {addr.state} - {addr.zipCode}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Phone: {addr.phone}
                  </p>

                  <button 
                    onClick={() => handleDeleteAddress(addr._id)}
                    style={{
                      marginTop: '10px', background: 'none', border: 'none', color: '#B5AABF', cursor: 'pointer', transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#B5AABF'}
                  >
                    <FaTrash size={10} /> Delete Address
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
