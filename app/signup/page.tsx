"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authApi, type SignupRequest } from "@/lib/api/auth";
import { emailApi } from "@/lib/api/email";
import { useAuth } from "@/contexts/AuthContext";

// 유효성 검사 함수들
const validateEmail = (email: string): string | null => {
  if (!email) return "이메일은 필수입니다.";
  if (email.length > 100) return "이메일은 100자를 초과할 수 없습니다.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "올바른 이메일 형식이 아닙니다.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "비밀번호는 필수입니다.";
  // 8~30자, 영소문자+숫자+특수기호(@$!%*?&)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[a-z0-9@$!%*?&]{8,30}$/;
  if (!passwordRegex.test(password)) {
    return "비밀번호는 8~30자, 영소문자+숫자+특수기호(@$!%*?&)를 포함해야 합니다.";
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name) return "이름은 필수입니다.";
  if (name.length < 2 || name.length > 20) {
    return "이름은 2자 이상 20자 이하로 입력해주세요.";
  }
  // 한글 또는 영문만
  const nameRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return "이름은 한글 또는 영문만 입력 가능합니다.";
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return "전화번호는 필수입니다.";
  // 하이픈 없이 10~11자리 숫자만
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone)) {
    return "전화번호는 하이픈(-) 없이 10~11자리 숫자만 입력 가능합니다.";
  }
  return null;
};

const validateBirth = (birth: string): string | null => {
  if (!birth) return "생년월일은 필수입니다.";
  const birthDate = new Date(birth);
  const today = new Date();
  if (birthDate >= today) {
    return "생년월일은 과거 날짜여야 합니다.";
  }
  return null;
};

const validateVerificationCode = (code: string): string | null => {
  if (!code) return "인증 코드를 입력해주세요.";
  if (code.length !== 6) return "인증 코드는 6자리입니다.";
  if (!/^\d{6}$/.test(code)) return "인증 코드는 숫자만 입력 가능합니다.";
  return null;
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getKakaoAuthorizeUrl, kakaoLogin } = useAuth();
  const [formData, setFormData] = useState<
    SignupRequest & { passwordConfirm: string }
  >({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    birth: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null
  );
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  const handleKakaoCallback = useCallback(
    async (code: string, state: string) => {
      setError("");
      setIsKakaoLoading(true);

      try {
        await kakaoLogin({ code });
        router.push("/");
      } catch (err) {
        if (err instanceof Error) {
          // 이메일 정보 미동의 시 처리
          if (err.message.includes("이메일 정보 제공에 동의")) {
            setError(
              "이메일 정보 제공에 동의해주세요. 카카오 계정 설정에서 동의 후 다시 시도해주세요."
            );
          } else {
            setError(err.message);
          }
        } else {
          setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
        }
        setIsKakaoLoading(false);
      }
    },
    [kakaoLogin, router]
  );

  // 카카오 로그인 콜백 처리
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      handleKakaoCallback(code, state);
    }
  }, [searchParams, handleKakaoCallback]);

  const handleKakaoLoginClick = async () => {
    setError("");
    setIsKakaoLoading(true);

    try {
      // 백엔드에서 카카오 로그인 URL 조회
      const urlResponse = await getKakaoAuthorizeUrl();
      // 카카오 로그인 페이지로 리다이렉트
      window.location.href = urlResponse.authorizeUrl;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("카카오 로그인 처리 중 오류가 발생했습니다.");
      }
      setIsKakaoLoading(false);
    }
  };

  // 타이머 처리 (이메일 인증 완료 시 타이머 중지)
  useEffect(() => {
    if (resendTimer > 0 && !isEmailVerified) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isEmailVerified && resendTimer > 0) {
      // 인증 완료 시 타이머 리셋
      setResendTimer(0);
    }
  }, [resendTimer, isEmailVerified]);

  // 이메일 중복 체크 (debounce)
  useEffect(() => {
    if (!formData.email || validateEmail(formData.email)) {
      setIsEmailAvailable(null);
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }

    const checkEmailTimer = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const response = await emailApi.checkDuplicate({
          email: formData.email,
        });
        if (response.data) {
          setIsEmailAvailable(response.data.available || false);
          // 에러는 UI에서 표시하므로 여기서는 설정하지 않음
        }
      } catch (err) {
        if (err instanceof Error) {
          setErrors((prev) => ({ ...prev, email: err.message }));
        }
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(checkEmailTimer);
  }, [formData.email]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // 필드별 에러 초기화
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (error) setError("");

    // 이메일 변경 시 인증 상태 초기화
    if (field === "email") {
      setIsEmailVerified(false);
      setIsEmailAvailable(null);
      setVerificationCode("");
      setIsCodeSent(false);
    }
  };

  const handleSendVerificationCode = async () => {
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ ...errors, email: emailError });
      return;
    }

    if (isEmailAvailable === false) {
      setErrors({ ...errors, email: "이미 사용 중인 이메일입니다." });
      return;
    }

    setIsSendingCode(true);
    setError("");

    try {
      await emailApi.sendVerificationCode({ email: formData.email });
      setResendTimer(180); // 3분
      setIsCodeSent(true);
      alert("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setErrors({ ...errors, verificationCode: codeError });
      return;
    }

    setIsVerifyingCode(true);
    setError("");

    try {
      await emailApi.verifyCode({
        email: formData.email,
        code: verificationCode,
      });
      setIsEmailVerified(true);
      setResendTimer(0); // 인증 완료 시 타이머 리셋
      setErrors({ ...errors, verificationCode: "" });
      alert("이메일 인증이 완료되었습니다.");
    } catch (err) {
      if (err instanceof Error) {
        setErrors({ ...errors, verificationCode: err.message });
      } else {
        setErrors({
          ...errors,
          verificationCode: "인증 코드가 일치하지 않습니다.",
        });
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEmailVerified) {
      newErrors.email = "이메일 인증을 완료해주세요.";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
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
    setError("");

    if (!validateForm()) {
      return;
    }

    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const { passwordConfirm, ...signupData } = formData;
      const response = await authApi.signup(signupData);

      if (response.data) {
        alert("회원가입이 완료되었습니다.");
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/doncrytt-logo2.png"
                alt="doncrytt 로고"
                width={200}
                height={80}
                className="h-16 w-auto mx-auto"
                priority
              />
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-red-600 hover:text-red-500"
            >
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleKakaoLoginClick}
              disabled={isLoading || isKakaoLoading}
              className="flex-1 flex justify-center py-3 px-4 border border-yellow-400 text-sm font-bold rounded-lg text-gray-800 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isKakaoLoading ? "카카오 로그인 중..." : "카카오로 가입"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isEmailVerified}
                  className={`flex-1 appearance-none relative block px-3 py-2 border ${
                    errors.email
                      ? "border-red-300"
                      : isEmailVerified
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:opacity-60`}
                  placeholder="이메일 주소"
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={
                    isSendingCode ||
                    isEmailVerified ||
                    resendTimer > 0 ||
                    isCheckingEmail ||
                    isEmailAvailable !== true
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSendingCode
                    ? "발송 중..."
                    : resendTimer > 0
                    ? formatTimer(resendTimer)
                    : "인증 코드 발송"}
                </button>
              </div>
              {isCheckingEmail && (
                <p className="mt-1 text-sm text-gray-500">이메일 확인 중...</p>
              )}
              {!isCheckingEmail && isEmailAvailable === false && (
                <p className="mt-1 text-sm text-red-600">
                  이미 사용 중인 이메일입니다.
                </p>
              )}
              {!isCheckingEmail &&
                isEmailAvailable === true &&
                !isEmailVerified &&
                !isCodeSent && (
                  <p className="mt-1 text-sm text-green-600">
                    사용 가능한 이메일입니다.
                  </p>
                )}
              {!isCheckingEmail && isCodeSent && !isEmailVerified && (
                <p className="mt-1 text-sm text-green-600">
                  이메일이 전송되었습니다.
                </p>
              )}
              {isEmailVerified && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ 이메일 인증이 완료되었습니다.
                </p>
              )}
              {errors.email && isEmailAvailable !== false && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {!isEmailVerified && (
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  인증 코드 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setVerificationCode(value);
                      if (errors.verificationCode) {
                        setErrors({ ...errors, verificationCode: "" });
                      }
                    }}
                    className={`flex-1 appearance-none relative block px-3 py-2 border ${
                      errors.verificationCode
                        ? "border-red-300"
                        : "border-gray-300"
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    placeholder="6자리 인증 코드"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifyingCode || verificationCode.length !== 6}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isVerifyingCode ? "인증 중..." : "인증 확인"}
                  </button>
                </div>
                {errors.verificationCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.verificationCode}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="이름 (2~20자, 한글 또는 영문)"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/[^0-9]/g, ""))
                }
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="전화번호 (하이픈 없이 10~11자리)"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="birth"
                className="block text-sm font-medium text-gray-700"
              >
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                id="birth"
                name="birth"
                type="date"
                required
                value={formData.birth}
                onChange={(e) => handleChange("birth", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.birth ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />
              {errors.birth && (
                <p className="mt-1 text-sm text-red-600">{errors.birth}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={formData.passwordConfirm}
                onChange={(e) =>
                  handleChange("passwordConfirm", e.target.value)
                }
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.passwordConfirm ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="비밀번호 확인"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isEmailVerified}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
            {!isEmailVerified && (
              <p className="mt-2 text-sm text-center text-red-600">
                이메일 인증을 완료해주세요.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
