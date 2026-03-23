import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type Language = "tr" | "en";
type Params = Record<string, string | number>;

const STORAGE_KEY = "piclog.language";

const translations: Record<Language, Record<string, string>> = {
  tr: {
    "common.loading": "Yukleniyor...",
    "common.cancel": "Vazgec",
    "common.delete": "Sil",
    "common.warning": "Uyari",
    "common.error": "Hata",

    "tabs.feedTitle": "Akis",
    "tabs.noPosts": "Henuz paylasim yok.",
    "tabs.createTitle": "Fotograf Ekle",
    "tabs.settingsTitle": "Ayarlar",

    "create.pickFromGallery": "Galeriden Sec",
    "create.takePhoto": "Fotograf Cek",
    "create.notePlaceholder": "Not ekle...",
    "create.save": "Kaydet",
    "create.saving": "Kaydediliyor...",
    "create.hint": "Bir fotograf sec ve pixel gunlugune ekle.",

    "create.err.permissionGallery": "Galeri izni gerekli.",
    "create.err.permissionCamera": "Kamera izni gerekli.",
    "create.err.selectPhoto": "Lutfen bir fotograf secin veya cekin.",
    "create.err.addNote": "Lutfen bir not ekleyin.",
    "create.err.locationMissing":
      "Konum bilgisi alinamadi. Lutfen konum izinlerini kontrol edin.",
    "create.err.userMissing":
      "Kullanici bilgisi alinamadi. Lutfen tekrar giris yapin.",
    "create.err.weatherMissing":
      "Hava durum bilgisi alinamadi. Lutfen tekrar deneyin.",
    "create.err.photoDataMissing":
      "Fotograf verisi alinamadi. Lutfen tekrar deneyin.",
    "create.err.uploadFailed":
      "Fotograf yuklenirken bir hata olustu. Lutfen tekrar deneyin.",
    "create.err.pathMissing":
      "Yuklenen fotograf yolu alinamadi. Lutfen tekrar deneyin.",
    "create.err.saveFailed": "Gonderi kaydedilirken hata: {message}",
    "create.success": "Gonderi basariyla kaydedildi!",
    "create.err.generic": "Bir hata olustu. Lutfen tekrar deneyin.",

    "detail.err.notFound": "Kayit bulunamadi.",
    "detail.title": "Ani Detayi",
    "detail.notFound": "Kayit bulunamadi.",
    "detail.deleteTitle": "Aniyi sil",
    "detail.deleteConfirm": "Bu aniyi tamamen silmek istiyor musun?",
    "detail.cancel": "Vazgec",
    "detail.delete": "Sil",
    "detail.errorTitle": "Hata",
    "detail.deleteFailed": "Ani kaydi silinemedi.",
    "detail.deletedTitle": "Basarili",
    "detail.deletedMessage": "Ani silindi.",
    "detail.deleting": "Siliniyor...",
    "detail.deleteMemory": "Aniyi Sil",
    "detail.delete.confirmTitle": "Aniyi sil",
    "detail.delete.confirmMessage": "Bu aniyi tamamen silmek istiyor musun?",
    "detail.delete.noRecord": "Silinecek kayit bulunamadi.",
    "detail.delete.failed": "Ani kaydi silinemedi.",
    "detail.delete.success": "Ani silindi.",
    "detail.delete.button": "Aniyi Sil",
    "detail.delete.deleting": "Siliniyor...",
    "detail.imageMissing": "Gorsel bulunamadi.",

    "settings.theme": "Tema",
    "settings.theme.darkPurple": "Dark Purple",
    "settings.theme.kawaiiPink": "Kawaii Pink",
    "settings.switchTheme": "Tema Degistir",
    "settings.logout": "Cikis Yap",
    "settings.loggingOut": "Cikis Yapiliyor...",
    "settings.logoutFailed": "Cikis yapilamadi. Lutfen tekrar deneyin.",
    "settings.deleteAccount": "Hesabi Sil",
    "settings.deletingAccount": "Hesap Siliniyor...",
    "settings.deleteAccountTitle": "Hesabi Sil",
    "settings.deleteAccountConfirm":
      "Hesabini kalici olarak silmek istedigine emin misin? Bu islem geri alinamaz.",
    "settings.deleteAccountSuccess": "Hesabin basariyla silindi.",
    "settings.deleteAccountFailed": "Hesap silinemedi. Lutfen tekrar deneyin.",

    "auth.login.title": "Giris Yap",
    "auth.login.email": "E-posta",
    "auth.login.password": "Sifre",
    "auth.login.submit": "Giris Yap",
    "auth.login.submitting": "Giris yapiliyor...",
    "auth.login.forgot": "Sifremi unuttum",
    "auth.login.noAccount": "Hesabin yok mu? Kayit ol",
    "auth.login.err.required": "E-posta ve sifre gerekli.",
    "auth.login.err.failed": "Giris yapilamadi.",

    "auth.register.title": "Kayit Ol",
    "auth.register.fullName": "Ad Soyad",
    "auth.register.username": "Kullanici adi",
    "auth.register.email": "E-posta",
    "auth.register.password": "Sifre (en az 6 karakter)",
    "auth.register.submit": "Kayit Ol",
    "auth.register.submitting": "Kayit yapiliyor...",
    "auth.register.hasAccount": "Zaten hesabin var mi? Giris yap",
    "auth.register.resend": "Onay e-postasini tekrar gonder",
    "auth.register.resending": "Gonderiliyor...",
    "auth.register.err.name": "Ad soyad gerekli.",
    "auth.register.err.username": "Kullanici adi gerekli.",
    "auth.register.err.required": "E-posta ve sifre gerekli.",
    "auth.register.err.password": "Sifre en az 6 karakter olmali.",
    "auth.register.err.failed": "Kayit olusturulamadi.",
    "auth.register.success":
      "Hesabin olusturuldu. E-posta onayi aciksa gelen kutunu kontrol et, ardindan giris yap.",
    "auth.register.resendFailed": "Onay e-postasi tekrar gonderilemedi.",
    "auth.register.resendSuccess":
      "Onay e-postasi tekrar gonderildi. Gelen kutunu kontrol et.",

    "auth.forgot.title": "Sifremi unuttum",
    "auth.forgot.hint":
      "Kayitli e-posta adresinizi girin. Size sifre sifirlama linki gonderecegiz.",
    "auth.forgot.email": "E-posta",
    "auth.forgot.submit": "Sifirlama linki gonder",
    "auth.forgot.submitting": "Gonderiliyor...",
    "auth.forgot.back": "Giris sayfasina don",
    "auth.forgot.sentTitle": "E-posta gonderildi",
    "auth.forgot.sentText":
      "Sifre sifirlama linki {email} adresine gonderildi. Gelen kutunuzu (ve spam klasorunu) kontrol edin.",
    "auth.forgot.err.required": "E-posta adresi gerekli.",
    "auth.forgot.err.failed": "Sifre sifirlama e-postasi gonderilemedi.",

    "logcard.label": "PIXEL MEMORY",
    "logcard.noImage": "Gorsel yok",
    "logcard.defaultTitle": "Ani #{id}",
  },
  en: {
    "common.loading": "Loading...",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.warning": "Warning",
    "common.error": "Error",

    "tabs.feedTitle": "Feed",
    "tabs.noPosts": "No posts yet.",
    "tabs.createTitle": "Add Photo",
    "tabs.settingsTitle": "Settings",

    "create.pickFromGallery": "Pick from Gallery",
    "create.takePhoto": "Take Photo",
    "create.notePlaceholder": "Add a note...",
    "create.save": "Save",
    "create.saving": "Saving...",
    "create.hint": "Pick a photo and add it to your pixel journal.",

    "create.err.permissionGallery": "Gallery permission is required.",
    "create.err.permissionCamera": "Camera permission is required.",
    "create.err.selectPhoto": "Please pick or capture a photo.",
    "create.err.addNote": "Please add a note.",
    "create.err.locationMissing":
      "Location could not be retrieved. Please check location permissions.",
    "create.err.userMissing":
      "User info could not be retrieved. Please sign in again.",
    "create.err.weatherMissing":
      "Weather data could not be retrieved. Please try again.",
    "create.err.photoDataMissing":
      "Photo data could not be read. Please try again.",
    "create.err.uploadFailed": "Failed to upload photo. Please try again.",
    "create.err.pathMissing":
      "Uploaded photo path is missing. Please try again.",
    "create.err.saveFailed": "Error while saving post: {message}",
    "create.success": "Post saved successfully!",
    "create.err.generic": "Something went wrong. Please try again.",

    "detail.err.notFound": "Record not found.",
    "detail.title": "Memory Detail",
    "detail.notFound": "Record not found.",
    "detail.deleteTitle": "Delete memory",
    "detail.deleteConfirm": "Do you want to permanently delete this memory?",
    "detail.cancel": "Cancel",
    "detail.delete": "Delete",
    "detail.errorTitle": "Error",
    "detail.deleteFailed": "Failed to delete memory.",
    "detail.deletedTitle": "Success",
    "detail.deletedMessage": "Memory deleted.",
    "detail.deleting": "Deleting...",
    "detail.deleteMemory": "Delete Memory",
    "detail.delete.confirmTitle": "Delete memory",
    "detail.delete.confirmMessage":
      "Do you want to permanently delete this memory?",
    "detail.delete.noRecord": "No record found to delete.",
    "detail.delete.failed": "Failed to delete memory.",
    "detail.delete.success": "Memory deleted.",
    "detail.delete.button": "Delete Memory",
    "detail.delete.deleting": "Deleting...",
    "detail.imageMissing": "Image not found.",

    "settings.theme": "Theme",
    "settings.theme.darkPurple": "Dark Purple",
    "settings.theme.kawaiiPink": "Kawaii Pink",
    "settings.switchTheme": "Switch Theme",
    "settings.logout": "Logout",
    "settings.loggingOut": "Logging out...",
    "settings.logoutFailed": "Logout failed. Please try again.",
    "settings.deleteAccount": "Delete Account",
    "settings.deletingAccount": "Deleting account...",
    "settings.deleteAccountTitle": "Delete Account",
    "settings.deleteAccountConfirm":
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
    "settings.deleteAccountSuccess": "Your account was deleted successfully.",
    "settings.deleteAccountFailed":
      "Account could not be deleted. Please try again.",

    "auth.login.title": "Sign In",
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.submit": "Sign In",
    "auth.login.submitting": "Signing in...",
    "auth.login.forgot": "Forgot password",
    "auth.login.noAccount": "No account yet? Sign up",
    "auth.login.err.required": "Email and password are required.",
    "auth.login.err.failed": "Sign in failed.",

    "auth.register.title": "Sign Up",
    "auth.register.fullName": "Full Name",
    "auth.register.username": "Username",
    "auth.register.email": "Email",
    "auth.register.password": "Password (min 6 chars)",
    "auth.register.submit": "Sign Up",
    "auth.register.submitting": "Signing up...",
    "auth.register.hasAccount": "Already have an account? Sign in",
    "auth.register.resend": "Resend confirmation email",
    "auth.register.resending": "Sending...",
    "auth.register.err.name": "Full name is required.",
    "auth.register.err.username": "Username is required.",
    "auth.register.err.required": "Email and password are required.",
    "auth.register.err.password": "Password must be at least 6 characters.",
    "auth.register.err.failed": "Could not create account.",
    "auth.register.success":
      "Your account has been created. If email confirmation is enabled, check your inbox and then sign in.",
    "auth.register.resendFailed": "Could not resend confirmation email.",
    "auth.register.resendSuccess":
      "Confirmation email sent again. Check your inbox.",

    "auth.forgot.title": "Forgot Password",
    "auth.forgot.hint":
      "Enter your registered email. We will send you a reset link.",
    "auth.forgot.email": "Email",
    "auth.forgot.submit": "Send reset link",
    "auth.forgot.submitting": "Sending...",
    "auth.forgot.back": "Back to login",
    "auth.forgot.sentTitle": "Email sent",
    "auth.forgot.sentText":
      "A password reset link was sent to {email}. Check your inbox (and spam folder).",
    "auth.forgot.err.required": "Email is required.",
    "auth.forgot.err.failed": "Could not send password reset email.",

    "logcard.label": "PIXEL MEMORY",
    "logcard.noImage": "No image",
    "logcard.defaultTitle": "Memory #{id}",
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Params) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("tr");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (saved === "tr" || saved === "en") {
          setLanguageState(saved);
        }
      } catch {
        // Ignore read failures and keep default language.
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, params?: Params) => {
      const table = translations[language] ?? translations.tr;
      let value = table[key] ?? key;
      if (!params) return value;

      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replaceAll(`{${paramKey}}`, String(paramValue));
      }
      return value;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
