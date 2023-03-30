import { useLayoutEffect, useMediaQuery } from '@studio-freight/hamo'
import cn from 'clsx'
import { ComposableImage } from 'components/composable-image'
import { ClientOnly } from 'components/isomorphic'
import { LayoutMobile } from 'components/layout-mobile'
import { Link } from 'components/link'
import { ScrollableBox } from 'components/scrollable-box'
import { fetchCmsQuery } from 'contentful/api'
import {
  contactEntryQuery,
  footerEntryQuery,
  projectListEntryQuery,
  studioFreightEntryQuery,
} from 'contentful/queries/home.graphql'
import { renderer } from 'contentful/renderer'
import { Layout } from 'layouts/default'
import { getForm } from 'lib/hubspot'
import { useStore } from 'lib/store'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import shallow from 'zustand/shallow'
import s from './home.module.scss'

const Arrow = dynamic(() => import('icons/arrow.svg'), { ssr: false })

const Gallery = dynamic(
  () => import('components/gallery').then(({ Gallery }) => Gallery),
  {
    ssr: false,
  }
)

export default function Home({ studioFreight, footer, contact, projects }) {
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [resetScroll, setResetScroll] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 800px)')
  const [selectedProject, setSelectedProject] = useStore(
    (state) => [state.selectedProject, state.setSelectedProject],
    shallow
  )
  const [setGalleryVisible] = useStore(
    (state) => [state.setGalleryVisible],
    shallow
  )

  useEffect(() => {
    setSelectedProject(projects.items[0])
  }, [])

  useLayoutEffect(() => {
    if (selectedProject) {
      setResetScroll(true)
      setTimeout(() => {
        setResetScroll(false)
      }, 100)
    }
  }, [selectedProject])

  return (
    <Layout
      theme="dark"
      principles={studioFreight.principles}
      studioInfo={{
        phone: studioFreight.phoneNumber,
        email: studioFreight.email,
      }}
      contactData={contact}
      footerLinks={footer.linksCollection.items}
    >
      {!isDesktop ? (
        <LayoutMobile studioFreight={studioFreight} projects={projects} />
      ) : (
        <ClientOnly>
          <div className={cn(s.content, 'layout-grid')}>
            <section className={s.about}>
              <p
                className={cn(s.title, 'p text-bold text-uppercase text-muted')}
              >
                About
              </p>
              <ScrollableBox className={s.description}>
                {renderer(studioFreight.about)}
              </ScrollableBox>
            </section>
            <section className={s.projects}>
              <p
                className={cn(s.title, 'p text-bold text-uppercase text-muted')}
              >
                Projects
              </p>
              <ScrollableBox className={s.list}>
                <ul>
                  {projects.items.map((project) => (
                    <li
                      key={project.sys.id}
                      className={cn(
                        selectedProject?.sys?.id === project.sys.id && s.active,
                        s['list-item']
                      )}
                    >
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                        }}
                      >
                        <p className="p text-bold text-uppercase">
                          {project.name}
                        </p>
                        <p className="p-xs text-uppercase">
                          {project.industry}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollableBox>
            </section>
            <section className={s['project-details']}>
              <div className={s.heading}>
                <p
                  className={cn(
                    s.title,
                    'p text-bold text-uppercase text-muted'
                  )}
                >
                  Project detail
                </p>
                <div className={s.actions}>
                  <button
                    className="p-s decorate"
                    onClick={() => setShowInfoModal(!showInfoModal)}
                  >
                    {showInfoModal ? 'close' : 'info'}
                  </button>
                  {selectedProject?.link && (
                    <Link
                      href={selectedProject?.link}
                      className={cn('p-s decorate', s.external)}
                    >
                      site
                      <Arrow className={s.arrow} />
                    </Link>
                  )}
                </div>
              </div>
              <div className={s['details-content']}>
                <div className={cn(s.images, !showInfoModal && s.visible)}>
                  <button
                    className={s['modal-trigger']}
                    onClick={() => setGalleryVisible(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 26 26"
                    >
                      <path
                        stroke="var(--green)"
                        d="M11 1H1v10M15 1h10v10M15 25h10V15M11 25H1V15m12-8v12m6-6H7"
                      />
                    </svg>
                  </button>
                  <ScrollableBox reset={showInfoModal || resetScroll}>
                    {selectedProject?.assetsCollection?.items.map(
                      (asset, i) => (
                        <button key={i} onClick={() => setGalleryVisible(true)}>
                          <ComposableImage sources={asset.imagesCollection} />
                        </button>
                      )
                    )}
                  </ScrollableBox>
                </div>
                <ScrollableBox
                  className={cn(s.info, showInfoModal && s.visible)}
                  reset={!showInfoModal || resetScroll}
                >
                  {selectedProject.description && (
                    <p className={cn(s.description, 'p')}>
                      {selectedProject.description}
                    </p>
                  )}
                  {selectedProject.testimonial && (
                    <div className={s.testimonial}>
                      <p
                        className={cn(
                          s.title,
                          'p text-muted text-uppercase text-bold'
                        )}
                      >
                        Testimonial
                      </p>
                      <p className="p">{selectedProject.testimonial}</p>
                    </div>
                  )}
                  {selectedProject?.services?.length > 0 && (
                    <div className={s.services}>
                      <p
                        className={cn(
                          s.title,
                          'p text-muted text-uppercase text-bold'
                        )}
                      >
                        Services
                      </p>
                      <p className="p-s text-uppercase">
                        {selectedProject?.services?.map((service, i) =>
                          i === selectedProject.services.length - 1
                            ? service
                            : `${service}, `
                        )}
                      </p>
                    </div>
                  )}
                  {selectedProject?.stack?.length > 0 && (
                    <div className={s.stack}>
                      <p
                        className={cn(
                          s.title,
                          'p text-muted text-uppercase text-bold'
                        )}
                      >
                        Stack
                      </p>
                      <p className="p-s text-uppercase">
                        {selectedProject?.stack?.map((item, i) =>
                          i === selectedProject.stack.length - 1
                            ? item
                            : `${item}, `
                        )}
                      </p>
                    </div>
                  )}
                </ScrollableBox>
              </div>
            </section>
          </div>
        </ClientOnly>
      )}

      <Gallery />
    </Layout>
  )
}

export async function getStaticProps({ preview = false }) {
  const [{ studioFreight }, { footer }, { contact }, { projectList }] =
    await Promise.all([
      fetchCmsQuery(studioFreightEntryQuery, {
        preview,
      }),
      fetchCmsQuery(footerEntryQuery, {
        preview,
      }),
      fetchCmsQuery(contactEntryQuery, {
        preview,
      }),
      fetchCmsQuery(projectListEntryQuery, {
        preview,
      }),
    ])

  contact.form = await getForm(contact.form)

  return {
    props: {
      studioFreight,
      footer,
      contact,
      projects: projectList.listCollection,
      id: 'home',
    },
    revalidate: 30,
  }
}
