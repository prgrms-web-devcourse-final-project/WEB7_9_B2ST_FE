'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, type SignupRequest } from '@/lib/api/auth';

// 유효성 검사 함수들
const validateEmail = (email: string): string | null => {
  if (!email) return '이메일은 필수입니다.';
  if (email.length > 100) return '이메일은 100자를 초과할 수 없습니다.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return '비밀번호는 필수입니다.';
  // 8~30자, 영소문자+숫자+특수기호(@$!%*?&)
  const passwordRegex = /^(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[a-z0-9@$!%*?&]{8,30}$/;
  if (!passwordRegex.test(password)) {
    return '비밀번호는 8~30자, 영소문자+숫자+특수기호(@$!%*?&)를 포함해야 합니다.';
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return '이름은 필수입니다.';
  if (name.length < 2 || name.length > 20) {
    return '이름은 2자 이상 20자 이하로 입력해주세요.';
  }
  // 한글 또는 영문만
  const nameRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return '이름은 한글 또는 영문만 입력 가능합니다.';
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return '전화번호는 필수입니다.';
  // 하이픈 없이 10~11자리 숫자만
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone)) {
    return '전화번호는 하이픈(-) 없이 10~11자리 숫자만 입력 가능합니다.';
  }
  return null;
};

const validateBirth = (birth: string): string | null => {
  if (!birth) return '생년월일은 필수입니다.';
  const birthDate = new Date(birth);
  const today = new Date();
  if (birthDate >= today) {
    return '생년월일은 과거 날짜여야 합니다.';
  }
  return null;
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupRequest & { passwordConfirm: string }>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    birth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // 필드별 에러 초기화
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const birthError = validateBirth(formData.birth);
    if (birthError) newErrors.birth = birthError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { passwordConfirm, ...signupData } = formData;
      const response = await authApi.signup(signupData);

      if (response.data) {
        alert('회원가입이 완료되었습니다.');
        router.push('/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              로그인
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="이메일 주소"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="이름 (2~20자, 한글 또는 영문)"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="전화번호 (하이픈 없이 10~11자리)"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="birth" className="block text-sm font-medium text-gray-700">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                id="birth"
                name="birth"
                type="date"
                required
                value={formData.birth}
                onChange={(e) => handleChange('birth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.birth ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
              />
              {errors.birth && (
                <p className="mt-1 text-sm text-red-600">{errors.birth}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="비밀번호 (8~30자, 영소문자+숫자+특수기호)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                영소문자, 숫자, 특수기호(@$!%*?&)를 포함한 8~30자
              </p>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={formData.passwordConfirm}
                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.passwordConfirm ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="비밀번호 확인"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
