import { SignUp } from '@clerk/nextjs'

const pageStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0e0f13',
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#4fffb0',
    colorBackground: '#16181f',
    colorInputBackground: '#1e2029',
    colorInputText: '#e8eaf0',
    colorText: '#e8eaf0',
    colorTextSecondary: '#6b7080',
    colorDanger: '#ff6b8a',
    borderRadius: '6px',
    fontFamily: "'DM Mono', monospace",
    fontFamilyButtons: "'DM Mono', monospace",
  },
  elements: {
    card: {
      background: '#16181f',
      border: '1px solid #2a2d38',
      boxShadow: 'none',
    },
    headerTitle: {
      color: '#e8eaf0',
      fontFamily: "'Fraunces', serif",
    },
    headerSubtitle: {
      color: '#6b7080',
    },
    formButtonPrimary: {
      background: '#4fffb0',
      color: '#0e0f13',
    },
    formFieldInput: {
      background: '#1e2029',
      border: '1px solid #2a2d38',
      color: '#e8eaf0',
    },
    formFieldLabel: {
      color: '#6b7080',
    },
    footerActionLink: {
      color: '#4fffb0',
    },
    identityPreviewText: {
      color: '#e8eaf0',
    },
    dividerLine: {
      background: '#2a2d38',
    },
    dividerText: {
      color: '#6b7080',
    },
  },
}

export default function SignUpPage() {
  return (
    <div style={pageStyle}>
      <SignUp appearance={clerkAppearance} />
    </div>
  )
}
