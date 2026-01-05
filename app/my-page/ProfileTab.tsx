'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mypageApi, type MyInfoRes, type RefundAccountRes, type BankRes } from '@/lib/api/mypage';

export default function ProfileTab() {
  const router = useRouter();
  const [myInfo, setMyInfo] = useState<MyInfoRes | null>(null);
  const [refundAccount, setRefundAccount] = useState<RefundAccountRes | null>(null);
  const [banks, setBanks] = useState<BankRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 비밀번호 변경 관련 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 회원 탈퇴 관련 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 환불 계좌 관련 상태
  const [accountForm, setAccountForm] = useState({
    bankCode: '',
    accountNumber: '',
    holderName: '',
  });
  const [accountError, setAccountError] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // 내 정보 조회
        const myInfoResponse = await mypageApi.getMyInfo();
        if (myInfoResponse.data) {
          setMyInfo(myInfoResponse.data);
        }

        // 환불 계좌 조회
        const accountResponse = await mypageApi.getRefundAccount();
        if (accountResponse.data) {
          setRefundAccount(accountResponse.data);
          setAccountForm({
            bankCode: accountResponse.data.bankCode || '',
            accountNumber: accountResponse.data.accountNumber || '',
            holderName: accountResponse.data.holderName || '',
          });
        }
        // 404는 계좌가 없는 정상적인 상태이므로 에러로 처리하지 않음

        // 은행 목록 조회
        const banksResponse = await mypageApi.getBankList();
        if (banksResponse.data) {
          setBanks(banksResponse.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사 (8~30자, 영소문자+숫자+특수기호)
    const passwordRegex = /^(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[a-z0-9@$!%*?&]{8,30}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      setPasswordError('비밀번호는 8~30자, 영소문자+숫자+특수기호(@$!%*?&)를 포함해야 합니다.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await mypageApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      alert('비밀번호가 성공적으로 변경되었습니다.');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 환불 계좌 저장
  const handleAccountSave = async () => {
    setAccountError('');

    if (!accountForm.bankCode || !accountForm.accountNumber || !accountForm.holderName) {
      setAccountError('모든 필드를 입력해주세요.');
      return;
    }

    // 계좌번호는 숫자만
    if (!/^\d+$/.test(accountForm.accountNumber)) {
      setAccountError('계좌번호는 숫자만 입력해주세요.');
      return;
    }

    setIsSavingAccount(true);

    try {
      await mypageApi.setRefundAccount({
        bankCode: accountForm.bankCode as "004" | "023" | "027" | "081" | "088" | "089" | "090" | "092" | "020" | "003" | "011" | "045" | "048" | "071",
        accountNumber: accountForm.accountNumber,
        holderName: accountForm.holderName,
      });

      alert('환불 계좌가 성공적으로 등록되었습니다.');
      
      // 계좌 정보 다시 조회
      try {
        const accountResponse = await mypageApi.getRefundAccount();
        if (accountResponse.data) {
          setRefundAccount(accountResponse.data);
        }
      } catch (err) {
        // 무시
      }
    } catch (err) {
      if (err instanceof Error) {
        setAccountError(err.message);
      } else {
        setAccountError('계좌 등록에 실패했습니다.');
      }
    } finally {
      setIsSavingAccount(false);
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    setWithdrawError('');

    if (!withdrawPassword) {
      setWithdrawError('비밀번호를 입력해주세요.');
      return;
    }

    if (!confirm('정말로 회원 탈퇴하시겠습니까?\n\n탈퇴 후에는 모든 정보가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    setIsWithdrawing(true);

    try {
      await mypageApi.withdraw({ password: withdrawPassword });
      
      // 로컬스토리지 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        setWithdrawError(err.message);
      } else {
        setWithdrawError('회원 탈퇴에 실패했습니다.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">회원정보</h2>
      
      <div className="space-y-6 max-w-2xl">
        {/* 내 정보 표시 */}
        {myInfo && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-600">이메일</span>
              <p className="text-gray-900">{myInfo.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">이름</span>
              <p className="text-gray-900">{myInfo.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">전화번호</span>
              <p className="text-gray-900">{myInfo.phone}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">생년월일</span>
              <p className="text-gray-900">
                {myInfo.birth ? new Date(myInfo.birth).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">이메일 인증</span>
              <span className={`px-2 py-1 rounded text-xs ${
                myInfo.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {myInfo.isEmailVerified ? '인증완료' : '미인증'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">본인인증</span>
              <span className={`px-2 py-1 rounded text-xs ${
                myInfo.isIdentityVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {myInfo.isIdentityVerified ? '인증완료' : '미인증'}
              </span>
            </div>
          </div>
        )}

        {/* 본인인증 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">본인인증</label>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">인증 상태</p>
              <p className="text-sm text-gray-600">
                {myInfo?.isIdentityVerified ? '인증완료' : '미인증'}
              </p>
            </div>
            {!myInfo?.isIdentityVerified && (
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                본인인증하기
              </button>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            비밀번호 변경
          </button>
        </div>

        {/* 환불계좌 관리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">환불계좌 관리</label>
          {refundAccount && (
            <div className="mb-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">등록된 계좌</p>
              <p className="font-medium text-gray-900">
                {refundAccount.bankName} {refundAccount.accountNumber} ({refundAccount.holderName})
              </p>
            </div>
          )}
          <div className="space-y-3">
            <select
              value={accountForm.bankCode}
              onChange={(e) => setAccountForm({ ...accountForm, bankCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">은행 선택</option>
              {banks.map((bank, index) => (
                <option key={bank.code || `bank-${index}`} value={bank.code || ''}>
                  {bank.name || ''}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="계좌번호 (숫자만 입력)"
              value={accountForm.accountNumber}
              onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              placeholder="예금주명"
              value={accountForm.holderName}
              onChange={(e) => setAccountForm({ ...accountForm, holderName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {accountError && (
              <p className="text-sm text-red-600">{accountError}</p>
            )}
            <button
              onClick={handleAccountSave}
              disabled={isSavingAccount}
              className="w-full px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingAccount ? '저장 중...' : '계좌 등록/수정'}
            </button>
          </div>
        </div>

        {/* 회원 탈퇴 */}
        <div className="border-t pt-6">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="px-6 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">비밀번호 변경</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  영소문자, 숫자, 특수기호(@$!%*?&)를 포함한 8~30자
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? '변경 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">회원 탈퇴</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ 주의사항</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>탈퇴 시 모든 회원 정보가 삭제됩니다</li>
                  <li>예매 내역, 응모 내역 등이 모두 삭제됩니다</li>
                  <li>삭제된 정보는 복구할 수 없습니다</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {withdrawError && (
                <p className="text-sm text-red-600">{withdrawError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawPassword('');
                    setWithdrawError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawing ? '탈퇴 중...' : '탈퇴하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

