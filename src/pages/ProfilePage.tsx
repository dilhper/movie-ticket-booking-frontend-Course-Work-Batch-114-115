import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { PageHeader } from '../components/common/PageHeader';
import { TextField } from '../components/common/FormFields';
import { initials } from '../utils/format';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({ type: 'warning', title: 'Name Required', message: 'Name cannot be empty.' });
      return;
    }

    try {
      setProfileSaving(true);
      const updated = await userService.updateMe({ name: name.trim(), phone: phone.trim() });
      updateUser(updated);
      showToast({ type: 'success', title: 'Profile Updated', message: 'Your personal info has been saved.' });
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast({ type: 'warning', title: 'Current Password', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      showToast({ type: 'warning', title: 'New Password', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'warning', title: 'Mismatch', message: 'New passwords do not match.' });
      return;
    }

    try {
      setPassSaving(true);
      await userService.changePassword({ currentPassword, newPassword });
      showToast({ type: 'success', title: 'Password Changed', message: 'Your password was successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Password Change Failed',
        message: err instanceof Error ? err.message : 'Could not change password.',
      });
    } finally {
      setPassSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-xl py-4 fade-in-up pb-5">
      <PageHeader
        title="Account Profile"
        subtitle="Manage your personal details, credentials, and account settings"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Profile' }]}
      />

      <div className="row g-4">
        {/* User Card (Left) */}
        <div className="col-lg-4">
          <div className="card-cine p-4 text-center">
            <div
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold display-6 mb-3 shadow"
              style={{
                width: 90,
                height: 90,
                background: user.role === 'ADMIN' ? 'linear-gradient(135deg, #ffb547, #ff7a45)' : 'linear-gradient(135deg, #ff3d6e, #ff7a45)',
              }}
            >
              {initials(user.name) || 'U'}
            </div>

            <h2 className="h5 fw-bold text-white mb-1">{user.name}</h2>
            <p className="text-muted small mb-2">{user.email}</p>

            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className={`badge rounded-pill ${user.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-primary'} px-3 py-1.5`}>
                <i className={`bi ${user.role === 'ADMIN' ? 'bi-shield-check' : 'bi-person'} me-1`} />
                {user.role}
              </span>
            </div>

            <div className="border-top border-secondary border-opacity-15 pt-3 text-start small text-muted d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span>Account ID:</span>
                <strong className="text-white">#{user.id}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Phone:</span>
                <strong className="text-white">{user.phone || 'Not set'}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Auth Type:</span>
                <span className="text-success fw-semibold">JWT Bearer Token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Details & Password (Right) */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {/* Edit Profile */}
            <div className="card-cine p-4">
              <h3 className="h6 fw-bold text-white mb-3 border-bottom border-secondary border-opacity-15 pb-2">
                <i className="bi bi-person-gear me-2 text-primary" /> Edit Profile Information
              </h3>

              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <TextField
                      id="prof-name"
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      icon="bi-person"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <TextField
                      id="prof-email"
                      label="Email Address"
                      value={user.email}
                      disabled
                      icon="bi-envelope"
                      hint="Email address cannot be changed."
                    />
                  </div>
                  <div className="col-md-6">
                    <TextField
                      id="prof-phone"
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      icon="bi-telephone"
                      placeholder="077 123 4567"
                    />
                  </div>
                </div>

                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-sm rounded-pill px-4"
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" /> Saving…
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="card-cine p-4">
              <h3 className="h6 fw-bold text-white mb-3 border-bottom border-secondary border-opacity-15 pb-2">
                <i className="bi bi-shield-lock me-2 text-warning" /> Change Password
              </h3>

              <form onSubmit={handleChangePassword}>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <TextField
                      id="curr-pass"
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <TextField
                      id="new-pass"
                      label="New Password"
                      type="password"
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <TextField
                      id="confirm-pass"
                      label="Confirm New Password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-outline-light btn-sm rounded-pill px-4"
                    disabled={passSaving}
                  >
                    {passSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" /> Updating…
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
