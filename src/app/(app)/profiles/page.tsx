import { redirect } from "next/navigation";
import {
  createLenderProfileFormAction,
  deleteLenderProfileFormAction,
  selectLenderProfileAction,
  updateLenderProfileFormAction,
} from "@/lib/lender-profiles/actions";
import { getActiveOrDefaultLenderProfile } from "@/lib/lender-profiles/default-profile";
import {
  lenderProfileAvatarOptions,
  lenderProfileThemeColors,
  suggestedLenderProfilePresets,
} from "@/lib/lender-profiles/identity";
import { mapLenderProfileRow, type LenderProfileRow } from "@/lib/lender-profiles/types";
import { createClient } from "@/lib/supabase/server";

type ProfilesPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/sign-in");
  }

  const { profile: activeProfile, error: activeProfileError } =
    await getActiveOrDefaultLenderProfile(supabase, user);

  const { data, error } = await supabase
    .from("lender_profiles")
    .select("id,user_id,name,avatar_emoji,theme_color,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  const profiles = ((data ?? []) as LenderProfileRow[]).map(
    mapLenderProfileRow,
  );
  const hasCustomProfiles = profiles.length > 1;
  const { error: actionError } = await searchParams;
  const visibleError = actionError ?? activeProfileError ?? error?.message;

  return (
    <main className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Lender profiles</p>
          <h2>เลือกโปรไฟล์ผู้ปล่อยกู้</h2>
          <p>โปรไฟล์ที่เลือกจะใช้กับแดชบอร์ด เงินกู้ และประวัติชำระเงินปัจจุบัน</p>
        </div>
      </section>

      <section className="panel profile-create-panel">
        <div className="section-heading">
          <div>
            <h2>สร้างโปรไฟล์</h2>
            <p>เริ่มจากชื่อที่ใช้จริง หรือเลือก preset ด้านล่างเพื่อสร้างเร็วขึ้น</p>
          </div>
        </div>

        <form action={createLenderProfileFormAction} className="auth-form auth-form--compact">
          <label className="field">
            <span>ชื่อโปรไฟล์</span>
            <input
              autoComplete="off"
              name="name"
              placeholder="เช่น แม่ปล่อยกู้"
              required
              maxLength={80}
            />
          </label>
          <ProfileIdentityControls />
          <button className="form-button" type="submit">
            สร้างโปรไฟล์
          </button>
        </form>

        {visibleError ? (
          <p className="inline-status is-error">{visibleError}</p>
        ) : null}
      </section>

      <section className="profile-presets" aria-label="Suggested lender profiles">
        <div className="section-heading">
          <div>
            <h2>แนะนำสำหรับเริ่มต้น</h2>
            <p>สร้างโปรไฟล์ยอดนิยมได้ในแตะเดียว แล้วค่อยแก้ชื่อ สี หรืออวาตาร์ภายหลัง</p>
          </div>
        </div>

        <div className="profile-preset-grid">
          {suggestedLenderProfilePresets.map((preset) => (
            <form action={createLenderProfileFormAction} key={preset.name}>
              <input name="name" type="hidden" value={preset.name} />
              <input name="avatarEmoji" type="hidden" value={preset.avatarEmoji} />
              <input name="themeColor" type="hidden" value={preset.themeColor} />
              <button
                className="profile-preset-button"
                data-profile-theme={preset.themeColor}
                type="submit"
              >
                <span aria-hidden="true">{preset.avatarEmoji}</span>
                <strong>{preset.name}</strong>
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="profile-grid" aria-label="Lender profiles">
        {!hasCustomProfiles ? (
          <div className="empty-state profile-empty-state" data-profile-theme={activeProfile?.themeColor ?? "green"}>
            <div className="empty-profile-identity">
              <span aria-hidden="true">{activeProfile?.avatarEmoji ?? "🧑"}</span>
              <strong>{activeProfile?.name ?? "โปรไฟล์หลัก"}</strong>
            </div>
            <h3>เริ่มจากโปรไฟล์หลักเรียบร้อย</h3>
            <p>ถ้าคุณปล่อยกู้ให้หลายบทบาท เช่น แม่ พ่อ หรือบัญชีส่วนตัว ให้สร้างโปรไฟล์แยกเพื่อให้แดชบอร์ด เงินกู้ และประวัติชำระเงินไม่ปนกัน</p>
          </div>
        ) : null}

        {profiles.map((profile) => {
          const isActive = activeProfile?.id === profile.id;
          const canDelete = profiles.length > 1;

          return (
            <article
              className={`profile-card ${isActive ? "is-active" : ""}`}
              data-profile-theme={profile.themeColor}
              key={profile.id}
            >
              <div className="profile-card__summary">
                <form action={selectLenderProfileAction}>
                  <input name="profileId" type="hidden" value={profile.id} />
                  <button className="profile-card__select" type="submit">
                    <span className="profile-card__avatar" data-profile-theme={profile.themeColor} aria-hidden="true">
                      {profile.avatarEmoji}
                    </span>
                    <span className="profile-card__body">
                      <strong>{profile.name}</strong>
                      <small>{isActive ? "กำลังใช้งาน" : "แตะเพื่อเลือก"}</small>
                    </span>
                  </button>
                </form>
              </div>

              <form action={updateLenderProfileFormAction} className="profile-card__edit">
                <input name="profileId" type="hidden" value={profile.id} />
                <label className="field">
                  <span>แก้ชื่อโปรไฟล์</span>
                  <input
                    autoComplete="off"
                    defaultValue={profile.name}
                    maxLength={80}
                    name="name"
                    required
                  />
                </label>
                <ProfileIdentityControls
                  avatarEmoji={profile.avatarEmoji}
                  themeColor={profile.themeColor}
                />
                <button className="form-button form-button--secondary" type="submit">
                  บันทึกชื่อ
                </button>
              </form>

              <form action={deleteLenderProfileFormAction}>
                <input name="profileId" type="hidden" value={profile.id} />
                <button
                  className="form-button form-button--danger"
                  disabled={!canDelete}
                  type="submit"
                >
                  ลบโปรไฟล์
                </button>
              </form>

              {!canDelete ? (
                <p className="profile-card__hint">ต้องมีอย่างน้อยหนึ่งโปรไฟล์เสมอ</p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function ProfileIdentityControls({
  avatarEmoji = "🧑",
  themeColor = "green",
}: {
  avatarEmoji?: string;
  themeColor?: string;
}) {
  return (
    <div className="profile-identity-grid">
      <div className="profile-option-group">
        <span>อวาตาร์</span>
        <div className="profile-option-row" role="radiogroup" aria-label="เลือกอวาตาร์โปรไฟล์">
          {lenderProfileAvatarOptions.map((emoji) => (
            <label className="profile-avatar-option" key={emoji}>
              <input
                defaultChecked={emoji === avatarEmoji}
                name="avatarEmoji"
                type="radio"
                value={emoji}
              />
              <span aria-hidden="true">{emoji}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-option-group">
        <span>สีโปรไฟล์</span>
        <div className="profile-option-row" role="radiogroup" aria-label="เลือกสีโปรไฟล์">
          {lenderProfileThemeColors.map((color) => (
            <label className="profile-color-option" data-profile-theme={color} key={color}>
              <input
                defaultChecked={color === themeColor}
                name="themeColor"
                type="radio"
                value={color}
              />
              <span>{getThemeLabel(color)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="profile-preview-chip" data-profile-theme={themeColor}>
        <span aria-hidden="true">{avatarEmoji}</span>
        <strong>ตัวอย่างโปรไฟล์</strong>
      </div>
    </div>
  );
}

function getThemeLabel(color: string) {
  return {
    blue: "น้ำเงิน",
    gold: "ทอง",
    green: "เขียว",
    rose: "ชมพู",
  }[color] ?? color;
}
